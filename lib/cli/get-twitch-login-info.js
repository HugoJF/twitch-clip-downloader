const prompts = require('prompts');
const path    = require('path');
const chalk  = require('chalk');

const {envExists, writeEnvFile} = require('./environment');

const promptForTwitchLoginInfo = async () => {
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
        }
    ];

    try {
        const result = await prompts(questions);

        if (!result || Object.keys(result).length != 2) {
            throw Error('Failed getting information from prompts.');
        }

        return result;
    }
    catch(error) {
        console.error(chalk.red('\nERROR'));
        console.error('Couldn\'t retrieve all the information prompted for.\n');
        console.error('Details:');
        console.error(error);

        process.exit(0);
    }
};

const createEnvIfNecessary = async () => {
    const alreadyExists = await envExists();

    if (!alreadyExists) {
        const {CLIENT_ID, CLIENT_SECRET} = await promptForTwitchLoginInfo();

        return writeEnvFile({CLIENT_ID, CLIENT_SECRET});
    }
};

module.exports = {
    createEnvIfNecessary,
    promptForTwitchLoginInfo
};
