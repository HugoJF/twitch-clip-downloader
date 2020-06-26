const chalk = require('chalk');

const printErrors = (...errors) => {
    console.error(`\n${chalk.redBright('ERROR!')}`);

    for (const error of errors) {
        console.error(error);
    }
};

const printErrorsAndExit = (...errors) => {
    printErrors(...errors);

    process.exit(0);
};

module.exports = {
    printErrors: printErrors,
    printErrorsAndExit
};
