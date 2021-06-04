import fs                    from 'fs';
import path                  from 'path';
import prompts               from 'prompts';
import {YoutubedlDownloader} from 'twitch-tools';
import {printErrorsAndExit}  from '../errors';

function validatePath(input: string): boolean | string {
    const resolved = path.resolve(input);

    if (!fs.existsSync(resolved)) {
        return 'This path does not exist!';
    }

    return true;
}

export async function binPathPrompt(): Promise<string> {
    const response = await prompts({
        type: 'text',
        name: 'BIN_PATH',
        message: 'Where should binaries be located at?',
        initial: path.resolve(process.cwd(), 'bin', (new YoutubedlDownloader).filename()),
        validate: validatePath
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get BIN_PATH input.');
    }

    return response.BIN_PATH;
}
