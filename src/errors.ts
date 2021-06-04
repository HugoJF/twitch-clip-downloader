import chalk from 'chalk';

export const printErrors = (...errors: any[]): void => {
    console.error(`\n${chalk.redBright('ERROR!')}`);

    for (const error of errors) {
        console.error(error);
    }
};

export const printErrorsAndExit = (...errors: any[]): void => {
    printErrors(...errors);

    process.exit(1);
};
