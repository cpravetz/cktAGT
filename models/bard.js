const Model = require('./bases/model.js');
const fetch =  require('node-fetch');
const logger = require('./../constants/logger.js');


class BardAI extends Model {

    session;
    token;
    initialized;
    ids;
    name = 'Bard';

    constructor(options = {}) {
        super();
        const {cookie = process.env.BARD_COOKIE} = options;
        this.initialized = false;
        this.session = {
            baseURL: "https://bard.google.com",
            headers: {
                Host: "bard.google.com",
                "X-Same-Domain": "1",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                Origin: "https://bard.google.com",
                Referer: "https://bard.google.com/",
                Cookie: `__Secure-1PSID=${options.cookie}`,
            }
        };
    }


    async init() {

        const response = await fetch("https://bard.google.com/", {
            method: "GET",
            headers: this.session.headers,
            credentials: "include",
        });
        logger.debug({response:response},'Bard: initialization response');
        const data = await response.text();

        const match = data.match(/SNlM0e":"(.*?)"/);

        if (match){
            this.token = match[1];
            logger.debug({token:this.token},' Got match');
        }
        else {
            logger.error('Could not get Google Bard.');
            throw new Error("Could not get Google Bard.");
        }
        this.initialized = true;
    }

    createBody(data) {
        return Object.entries(data)
            .map(([property, value]) => `${encodeURIComponent(property)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    async generate(message, parameters = {}) {
        const result = await this.chat(message, parameters);
        return result.content;
    }

    async chat(message, parameters = {}) {

        const options = {...parameters, ...this.ids};
        if (!this.initialized) {
            await this.init();
        }
        // Parameters and POST data
        const params = {
            bl: "boq_assistant-bard-web-server_20230523.13_p0",
            _reqID: parameters ? `${options._reqID}` : "0",
            rt: "c",
        };

        const messageStruct = [
            [message],
            null,
            parameters ? Object.values(parameters).slice(0, 3) : [null, null, null],
        ];

        const data = {
            "f.req": JSON.stringify([null, JSON.stringify(messageStruct)]),
            at: this.token,
        };

        const url = new URL(
            "/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
            this.session.baseURL
        );

        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

//        const queryBody = this.createBody(data);
        const queryBody = new URLSearchParams(data);

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: this.session.headers,
            body: queryBody,
            credentials: "include",
        });
        logger.debug({response:response},'Bard response');

        const responseData = await response.text();
        logger.debug({text:responseData},'Bard response text');

        const chatData = JSON.parse(responseData.split("\n")[3])[0][2];

        // Check if there is data
        if (!chatData) {
            logger.error(`Google Bard encountered an error ${responseData}.`);
            return `Google Bard encountered an error ${responseData}.`;
        }

        // Get important data, and update with important data if set to do so
        const jsonChatData = JSON.parse(chatData);

        let text = jsonChatData[0][0];

        let images = jsonChatData[4][0][4]
            ? jsonChatData[4][0][4].map((x) => {
                  return {
                      tag: x[2],
                      url: x[0][5].match(/imgurl=([^&%]+)/)[1],
                  };
              })
            : undefined;

        this.ids =  {
            // Make sure kept in order, because using Object.keys() to query above
            conversationID: jsonChatData[1][0],
            responseID: jsonChatData[1][1],
            choiceID: jsonChatData[4][0][0],
            _reqID: parseInt(parameters._reqID) ?? 0 + 100000,
        };

        const result = {
            content: this.formatMarkdown(text, images),
            images: images,
            ids: this.ids,
        };
        logger.debug({result:result},`Bard: result from generate`);
        return result;
    }

    formatMarkdown(text, images)  {
        if (!images) return text;

        const formattedTags = new Map();

        for (let imageData of images) {
            const formattedTag = `![${imageData.tag.slice(1, -1)}](${
                imageData.url
            })`;

            if (formattedTags.has(imageData.tag)) {
                const existingFormattedTag = formattedTags.get(imageData.tag);

                formattedTags.set(
                    imageData.tag,
                    `${existingFormattedTag}\n${formattedTag}`
                );
            } else {
                formattedTags.set(imageData.tag, formattedTag);
            }
        }

        for (let [tag, formattedTag] of formattedTags) {
            text = text.replace(tag, formattedTag);
        }

        return text;
    }
};


module.exports = BardAI;