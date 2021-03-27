import {videosParallelDownloadsPrompt} from './prompts/videos-parallel-downloads-prompt';
import {clipsParallelDownloadsPrompt}  from './prompts/clips-parallel-downloads-prompt';
import {clientSecretPrompt}            from './prompts/client-secret-prompt';
import {basepathPrompt}                from './prompts/basepath-prompt';
import {clientIdPrompt}                from './prompts/client-id-prompt';
import {binPathPrompt}                 from './prompts/youtube-dl-path-prompt';
import {debugPrompt}                   from './prompts/debug-prompt';


export const envPrompt = async (): Promise<Environment> => {
    const BIN_PATH: string = await binPathPrompt();
    const BASEPATH: string = await basepathPrompt();
    const CLIENT_ID: string = await clientIdPrompt();
    const CLIENT_SECRET: string = await clientSecretPrompt();
    const DEBUG: string = await debugPrompt();
    const VIDEOS_PARALLEL_DOWNLOADS: string = await videosParallelDownloadsPrompt();
    const CLIPS_PARALLEL_DOWNLOADS: string = await clipsParallelDownloadsPrompt();

    return {
        CLIENT_ID,
        CLIENT_SECRET,
        DEBUG,
        VIDEOS_PARALLEL_DOWNLOADS,
        CLIPS_PARALLEL_DOWNLOADS,
        BASEPATH,
        BIN_PATH,
        DEFAULT_PERIOD_HOURS: 24,
    };
};
