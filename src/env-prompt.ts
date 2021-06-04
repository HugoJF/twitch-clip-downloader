import {Environment}                   from 'twitch-tools';
import {videosParallelDownloadsPrompt} from './prompts/videos-parallel-downloads-prompt';
import {clipsParallelDownloadsPrompt}  from './prompts/clips-parallel-downloads-prompt';
import {clientSecretPrompt}            from './prompts/client-secret-prompt';
import {basepathPrompt}                from './prompts/basepath-prompt';
import {clientIdPrompt}                from './prompts/client-id-prompt';
import {binPathPrompt}                 from './prompts/youtube-dl-path-prompt';
import {debugPrompt}                   from './prompts/debug-prompt';

export const envPrompt = async (): Promise<Environment> => {
    return {
        BIN_PATH: await binPathPrompt(),
        BASEPATH: await basepathPrompt(),
        CLIENT_ID: await clientIdPrompt(),
        CLIENT_SECRET: await clientSecretPrompt(),
        DEBUG: await debugPrompt(),
        VIDEOS_PARALLEL_DOWNLOADS: await videosParallelDownloadsPrompt(),
        CLIPS_PARALLEL_DOWNLOADS: await clipsParallelDownloadsPrompt(),
        DEFAULT_PERIOD_HOURS: 24,
    };
};
