const chalk = require('chalk');

export const printErrors = (...errors: any[]) => {
    console.error(`\n${chalk.redBright('ERROR!')}`);

    for (const error of errors) {
        console.error(error);
    }
};

export const printErrorsAndExit = (...errors: any[]) => {
    printErrors(...errors);

    process.exit(0);
};
