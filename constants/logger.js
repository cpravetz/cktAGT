const pino = require('pino');

const transport = pino.transport({
    targets: [
      {
        target: 'pino/file',
        level: 'debug',
        options: { destination: `./logs/app.log` },
      },
      {
        target: 'pino-pretty', // logs to the standard output by default
        level: 'debug',
        options: {
            colorize:true
        }
      },
    ],
  });

// Create a logging instance
const logger = pino({
level: process.env.LOG_LEVEL || 'info',
},transport);
module.exports = logger;