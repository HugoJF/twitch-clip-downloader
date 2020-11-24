import {clientIdPrompt}                from "./client-id-prompt";
import {clientSecretPrompt}            from "./client-secret-prompt";
import {debugPrompt}                   from "./debug-prompt";
import {videosParallelDownloadsPrompt} from "./videos-parallel-downloads-prompt";
import {clipsParallelDownloadsPrompt}  from "./clips-parallel-downloads-prompt";
import {basepathPrompt}                from "./basepath-prompt";

export const envPrompt = async () => {
    const BASEPATH = await basepathPrompt();
    const CLIENT_ID = await clientIdPrompt();
    const CLIENT_SECRET = await clientSecretPrompt();
    const DEBUG = await debugPrompt();
    const VIDEOS_PARALLEL_DOWNLOADS = await videosParallelDownloadsPrompt();
    const CLIPS_PARALLEL_DOWNLOADS = await clipsParallelDownloadsPrompt();

    return { CLIENT_ID, CLIENT_SECRET, DEBUG, VIDEOS_PARALLEL_DOWNLOADS, CLIPS_PARALLEL_DOWNLOADS, BASEPATH };
};
