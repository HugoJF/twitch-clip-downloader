import {clientIdPrompt}                from './prompts/client-id-prompt';
import {clientSecretPrompt}            from './prompts/client-secret-prompt';
import {debugPrompt}                   from './prompts/debug-prompt';
import {videosParallelDownloadsPrompt} from './prompts/videos-parallel-downloads-prompt';
import {clipsParallelDownloadsPrompt}  from './prompts/clips-parallel-downloads-prompt';
import {basepathPrompt}                from './prompts/basepath-prompt';
import {youtubeDlPathPrompt}           from './prompts/youtube-dl-path-prompt';

enum EnvVariables {
    CLIENT_ID,
    CLIENT_SECRET,
    DEBUG,
    VIDEOS_PARALLEL_DOWNLOADS,
    CLIPS_PARALLEL_DOWNLOADS,
    BASEPATH,
    YOUTUBE_DL_PATH,
}

type EnvironmentRecordType = Record<keyof typeof EnvVariables, string>

export const envPrompt = async (): Promise<EnvironmentRecordType> => {
    const YOUTUBE_DL_PATH: string = await youtubeDlPathPrompt();
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
        YOUTUBE_DL_PATH,
    };
};
