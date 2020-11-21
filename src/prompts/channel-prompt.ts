import prompts              from "prompts";
import {printErrorsAndExit} from "../errors";

const CHANNEL_REGEX = /\.tv|\//g;

const validateChannel = (channel: string) => {
    if (channel.match(CHANNEL_REGEX)) {
        return 'Usernames only (without URLs)!';
    }

    if (channel.trim().length === 0) {
        return 'Usernames can\'t be empty!';
    }

    return true;
};

export async function channelPrompt() {
    const response = await prompts({
        type:     'text',
        name:     'channel',
        message:  'Which channel do you want to download media from?',
        validate: validateChannel
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get channel input.');
    }

    return response.channel;
}
