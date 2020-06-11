const dotenv  = require('dotenv');
const path    = require('path');
const chalk   = require('chalk');
const prompts = require('prompts');

const {writeFile, fileExists} = require('../filesystem');

const envPath = path.resolve(path.join(__dirname, '..', '..', '.env'));

const loadEnvironment = () => dotenv.config();

const ensureEnvironmentKeyIsLoaded = (key) => {
    if (!process.env[key]) {
        console.error(chalk.redBright('ERROR!'));
        console.error(`Environment variable ${chalk.underline.blue(key)} not set!`);
        console.error(`\nPlease set ${chalk.blue(key)} on ${chalk.cyan('.env')} file.`);
        process.exit(0);
    }
};

const promptForEnvInfo = async () => {
    const questions = [
        {
            type: 'text',
            name: 'CLIENT_ID',
            message: 'What is your Twitch CLIENT_ID?',
            validate: value => value.length > 0
        },
        {
            type: 'text',
            name: 'CLIENT_SECRET',
            message: 'What is your Twitch CLIENT_SECRET?',
            validate: value => value.length > 0
        },
        {
            type: 'confirm',
            name: 'DEBUG',
            message: 'Run in debug mode?',
            initial: false,
            format: value => `${value}`
        },
        {
            type: 'number',
            name: 'YOUTUBEDL_INSTANCES',
            message: 'How many youtubedl instances should we use?',
            initial: 3,
            min: 1
        }
    ];

    try {
        const result = await prompts(questions);

        if (!result || Object.keys(result).length != questions.length) {
            throw Error('Couldn\'t retrieve all the information prompted for.\n');
        }

        return result;
    }
    catch(error) {
        console.error(chalk.red('\nERROR'));
        console.error(error);

        process.exit(0);
    }
};

const createIfEnvNotSet = async () => {
    const envExists = await fileExists(envPath);

    if (!envExists) {
        const data = await promptForEnvInfo();

        await writeEnvFile(data);
    }
}

const ensureConfigsAreLoaded = async () => {
    await createIfEnvNotSet();

    loadEnvironment();

    const environmentKeys = [
        'DEBUG',
        'CLIENT_ID',
        'CLIENT_SECRET',
        'YOUTUBEDL_INSTANCES'
    ];

    environmentKeys.forEach(ensureEnvironmentKeyIsLoaded);
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

module.exports = {
    writeEnvFile,
    ensureConfigsAreLoaded
};
