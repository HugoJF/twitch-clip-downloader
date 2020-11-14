import ora                  from "ora";
import {fetchClips}         from "./clip-fetcher";
import {writeMetaFile}      from "./meta";
import prompts                                   from "prompts";
import {startClipsDownload, startVideosDownload} from "./media-downloader";
import cliProgress                               from "cli-progress";
import {fetchVideos}        from "./video-fetcher";

let apiSpinner: ora.Ora | null;
const downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

export async function videos(channel: string, userId: string) {
    /**
     * API fetching phase
     */

    let totalBatches = 0;
    let finishedBatches = 0;
    if (!apiSpinner) {
        apiSpinner = ora('Paginating API, please wait...').start();
    }

    function onCountUpdate(total: number) {
        if (apiSpinner) {
            apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
        }
    }

    const videos = await fetchVideos(userId, onCountUpdate);
    const videoCount = Object.values(videos).length;

    apiSpinner.succeed('Finished API pagination.');
    apiSpinner = null;

    /**
     * Metadata phase
     */
    // TODO: migrate to videos
    // writeMetaFile(channel, Object.values(videos));

    /**
     * Confirmation phase
     */

    const confirmation = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Found ${videoCount} videos to download, download now?`,
        initial: true
    });

    if (!confirmation.value) {
        console.log('Bye!');
        process.exit(0);
    }

    /**
     * Download phase
     */

    downloadBar.start(videoCount, 0);

    const finished = await startVideosDownload(Object.values(videos), count => downloadBar.update(count));

    downloadBar.stop();

    console.log(`Finished download of ${finished} out of ${videoCount}!`);
}
