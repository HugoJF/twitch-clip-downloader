import prompts              from 'prompts';
import path                 from 'path';
import fs                   from 'fs';
import {printErrorsAndExit} from '../errors';

const validatePath = (input: string) => {
    const resolved = path.resolve(input);

    if (!fs.existsSync(resolved)) {
        return 'This path does not exist!';
    }

    return true;
};

export async function youtubeDlPathPrompt() {
    const response = await prompts({
        type: 'text',
        name: 'YOUTUBE_DL_PATH',
        message: 'Where is youtube-dl executable located at?',
        initial: path.resolve(process.cwd(), 'bin', 'youtube-dl.exe'),

        validate: validatePath
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get CLIENT_ID input.');
    }

    return response.YOUTUBE_DL_PATH;
}
