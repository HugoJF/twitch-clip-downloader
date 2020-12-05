import {clientIdPrompt}                from './prompts/client-id-prompt';
import {clientSecretPrompt}            from './prompts/client-secret-prompt';
import {debugPrompt}                   from './prompts/debug-prompt';
import {videosParallelDownloadsPrompt} from './prompts/videos-parallel-downloads-prompt';
import {clipsParallelDownloadsPrompt}  from './prompts/clips-parallel-downloads-prompt';
import {basepathPrompt}                from './prompts/basepath-prompt';
import {youtubeDlPathPrompt}           from './prompts/youtube-dl-path-prompt';

export const envPrompt = async () => {
    const YOUTUBE_DL_PATH = await youtubeDlPathPrompt();
    const BASEPATH = await basepathPrompt();
    const CLIENT_ID = await clientIdPrompt();
    const CLIENT_SECRET = await clientSecretPrompt();
    const DEBUG = await debugPrompt();
    const VIDEOS_PARALLEL_DOWNLOADS = await videosParallelDownloadsPrompt();
    const CLIPS_PARALLEL_DOWNLOADS = await clipsParallelDownloadsPrompt();

    return {
        CLIENT_ID,
        CLIENT_SECRET,
        DEBUG,
        VIDEOS_PARALLEL_DOWNLOADS,
        CLIPS_PARALLEL_DOWNLOADS,
        BASEPATH,
        YOUTUBE_DL_PATH
    };
};
