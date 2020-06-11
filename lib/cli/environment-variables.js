const dotenv = require('dotenv');
const path = require('path');
const chalk = require('chalk');

const ensureEnvironmentKeyIsLoaded = (key) => {
    if (!process.env[key]) {
        console.error(chalk.redBright('ERROR!'));
        console.error(`Environment variable ${chalk.underline.blue(key)} not set!`);
        console.error(`\nPlease set ${chalk.blue(key)} on ${chalk.cyan('.env')} file.`);
        process.exit(0);
    }
};

const ensureEnvironmentFileIsValid = () => {
    const result = dotenv.config();

    if (result.error) {
        const envFileFolder = path.dirname(result.error.path);

        const envExamplePath = path.join(envFileFolder, '.env.example');

        console.error(chalk.redBright('ERROR!'));
        console.error('Environment file missing!\n');
        console.error(`Please create the file ${chalk.underline.cyan(result.error.path)}\n`);
        console.error(`See the example file: ${chalk.green(envExamplePath)}`);

        process.exit(0);
    }
};

const ensureConfigsAreLoaded = () => {
    ensureEnvironmentFileIsValid();

    ensureEnvironmentKeyIsLoaded('CLIENT_ID');
    ensureEnvironmentKeyIsLoaded('CLIENT_SECRET');
}

module.exports = {
    ensureConfigsAreLoaded
};
