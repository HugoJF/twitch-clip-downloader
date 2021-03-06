import fs                   from 'fs';
import path                 from 'path';
import prompts              from 'prompts';
import {printErrorsAndExit} from '../errors';

function validatePath(input: string) {
    const resolved = path.resolve(input);
    const testFile = path.resolve(resolved, 'test.txt');

    if (!fs.existsSync(resolved)) {
        return 'This path does not exist!';
    }

    try {
        fs.writeFileSync(testFile, 'hello world');
        fs.unlinkSync(testFile);
    } catch (e) {
        return 'Failed to write test file to directory';
    }

    return true;
}

export async function basepathPrompt(): Promise<string> {
    const response = await prompts({
        type: 'text',
        name: 'BASEPATH',
        message: 'Where should videos and clips be stored?',
        initial: process.cwd(),
        validate: validatePath
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get CLIENT_ID input.');
    }

    return response.BASEPATH;
}
