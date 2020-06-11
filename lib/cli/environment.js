const dotenv = require('dotenv');
const path   = require('path');
const chalk  = require('chalk');

const {writeFile, fileExists} = require('../filesystem');

const envPath = path.resolve(path.join(__dirname, '..', '..', '.env'));

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
        const envFileFolder = path.dirname(envPath);

        const envExamplePath = path.join(envFileFolder, '.env.example');

        console.error(chalk.redBright('ERROR!'));
        console.error('Environment file missing!\n');
        console.error(`Please create the file ${chalk.underline.cyan(envPath)}\n`);
        console.error(`See the example file: ${chalk.green(envExamplePath)}`);

        process.exit(0);
    }
};

const ensureConfigsAreLoaded = () => {
    ensureEnvironmentFileIsValid();

    ensureEnvironmentKeyIsLoaded('CLIENT_ID');
    ensureEnvironmentKeyIsLoaded('CLIENT_SECRET');
}

const writeEnvFile = async (values = {}) => {
    const DEFAULTS = {
        DEBUG:               false,
        CLIENT_ID:           '',
        CLIENT_SECRET:       '',
        YOUTUBEDL_INSTANCES: 3
    };

    const config = Object.assign({}, DEFAULTS, values);

    let fileContent = '';
    for(const key in config) {
        fileContent += `${key}=${config[key]}\n`;
    }

    return writeFile(envPath, fileContent);
};

const envExists = () => fileExists(envPath);

module.exports = {
    envExists,
    writeEnvFile,
    ensureConfigsAreLoaded
};
