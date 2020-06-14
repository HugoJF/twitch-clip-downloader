const chalk = require('chalk');

const printErrorMsgs = (...msgParts) => {
    console.error(`\n${chalk.redBright('ERROR!')}`);

    for (const part of msgParts) {
        console.error(part);
    }
};

const printErrorsAndExit = (...msgParts) => {
    printErrorMsgs(...msgParts);

    process.exit(0);
};

module.exports = {
    printErrorMsgs,
    printErrorsAndExit
};
