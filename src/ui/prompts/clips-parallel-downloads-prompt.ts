import prompts              from 'prompts';
import {printErrorsAndExit} from '../errors';

export async function clipsParallelDownloadsPrompt(): Promise<string> {
    const response = await prompts({
        type:    'number',
        name:    'CLIPS_PARALLEL_DOWNLOADS',
        message: 'How many clips should be downloaded at the same time?',
        initial: 20,
        min:     1
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get CLIPS_PARALLEL_DOWNLOADS input.');
    }

    return response.CLIPS_PARALLEL_DOWNLOADS;
}
