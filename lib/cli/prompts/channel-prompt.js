const prompts = require('prompts');

const { printErrorsAndExit } = require('../errors');

const validateChannel = (channel) => {
    if (channel.match(/\.tv|\//g)) {
        return 'Usernames only (without URLs)!';
    }

    if (channel.trim().length === 0) {
        return 'Usernames can\'t be empty!';
    }

    return true;
};

const channelPrompt = async () => {
    const response = await prompts({
        type:     'text',
        name:     'channel',
        message:  'What channel do you want to download clips from?',
        validate: validateChannel
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get channel input.');
    }

    return response.channel;
};

module.exports = channelPrompt;
