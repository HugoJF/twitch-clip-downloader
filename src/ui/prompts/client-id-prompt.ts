import prompts              from 'prompts';
import {printErrorsAndExit} from '../errors';

function validateClientId(value: string): boolean | string {
    if (value.trim().length === 0) {
        return 'CLIENT_ID can\'t be empty!';
    }

    return true;
}

export async function clientIdPrompt(): Promise<string> {
    const response = await prompts({
        type: 'text',
        name: 'CLIENT_ID',
        message: 'What is your Twitch CLIENT_ID?',
        validate: validateClientId
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get CLIENT_ID input.');
    }

    return response.CLIENT_ID;
}
