import prompts              from 'prompts';
import {printErrorsAndExit} from '../errors';

export async function videosParallelDownloadsPrompt() {
    const response = await prompts({
        type:    'number',
        name:    'VIDEOS_PARALLEL_DOWNLOADS',
        message: 'How many video fragments should be downloaded at the same time?',
        initial: 20,
        min:     1
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get VIDEOS_PARALLEL_DOWNLOADS input.');
    }

    return response.VIDEOS_PARALLEL_DOWNLOADS;
}
