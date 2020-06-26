const dotenv = require('dotenv');
const path   = require('path');
const chalk  = require('chalk');

const { writeFile, fileExists } = require('./filesystem');
const { printErrorsAndExit } = require('./errors');
const { envInfoPrompt } = require('./prompts');

const envPath = path.resolve(path.join(__dirname, '..', '..', '.env'));

const loadEnvironment = () => dotenv.config();

const ensureEnvironmentKeyIsLoaded = (key) => {
    if (!process.env[key]) {
        printErrorsAndExit(`Environment variable ${chalk.underline.blue(key)} not set!`,
            `\nPlease set ${chalk.blue(key)} on ${chalk.cyan('.env')} file.`);
    }
};

const createIfEnvNotSet = async () => {
    const envExists = await fileExists(envPath);

    if (!envExists) {
        console.log(`Looks like you haven't set your ${chalk.cyan('.env')} file yet!`);
        console.log(`We'll now generate this file, so have your Twitch ${chalk.green('CLIENT_ID')} and ${chalk.green('CLIENT_SECRET')} ready!\n`);
        console.log('If you don\'t have these at hand, here\'s a guide:');
        console.log(`Register an application on ${chalk.magenta('Twitch')} Console: ${chalk.underline.blue('https://dev.twitch.tv/console/apps')}`);
        console.log(`Click ${chalk.cyan('Manage')} and copy the ${chalk.green('CLIENT_ID')} and generate a ${chalk.green('CLIENT_SECRET')}.\n\n`);

        const data = await envInfoPrompt();

        await writeEnvFile(data);
    }
};

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
};

const writeEnvFile = async (values = {}) => {
    const DEFAULTS = {
        DEBUG:               false,
        CLIENT_ID:           '',
        CLIENT_SECRET:       '',
        YOUTUBEDL_INSTANCES: 3
    };

    const config = Object.assign({}, DEFAULTS, values);

    let fileContent = '';
    for (const key in config) {
        fileContent += `${key}=${config[key]}\n`;
    }

    return writeFile(envPath, fileContent);
};

module.exports = {
    writeEnvFile,
    ensureConfigsAreLoaded
};
