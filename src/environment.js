const dotenv = require('dotenv');
const path   = require('path');
const chalk  = require('chalk');
const envInfoPrompt = require('./prompts/env-prompt');
const { writeFile, fileExists } = require('./filesystem');
const { printErrorsAndExit } = require('./errors');

const envPath = path.resolve(path.join(__dirname, '..', '.env'));

const loadEnvironment = () => dotenv.config();

const DEFAULTS = {
    DEBUG:               false,
    CLIENT_ID:           '',
    CLIENT_SECRET:       '',
    YOUTUBEDL_INSTANCES: 3
};

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

    const environmentKeys = Object.keys(DEFAULTS);

    environmentKeys.forEach(ensureEnvironmentKeyIsLoaded);
};

const writeEnvFile = async (values = {}) => {
    const config = {...DEFAULTS, ...values};

    const pieces = Object.keys(config).map(key => `${key}=${config[key]}`);
    const fileContent = pieces.join('\n');

    return writeFile(envPath, fileContent);
};

module.exports = {
    writeEnvFile,
    ensureConfigsAreLoaded
};
