const pino = require("pino");

module.exports = pino(
    {
        level: "trace",
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.destination(`${__dirname}/app.log`),
);