import {channelPrompt} from './prompts/channel-prompt';
import {ensureConfigsAreLoaded} from "./environment";
import {startDownload} from "./clip-downloader";
import {fetchClips} from "./clip-fetcher";
import {api, load} from "./api";
import {writeMetaFile} from "./meta";
import cliProgress from "cli-progress";
import prompts from "prompts";
import ora from "ora";

let apiSpinner: ora.Ora | null;
const downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function fetchUserId (name: string) {
    const user = await api().users(name);

    return user.data.data[0].id;
}

async function start () {
    await ensureConfigsAreLoaded();

    const channel = await channelPrompt();

    await load();

    /**
     * API fetching phase
     */

    let totalBatches = 0;
    let finishedBatches = 0;
    if (!apiSpinner) {
        apiSpinner = ora('Paginating API, please wait...').start();
    }

    function onBatchGenerated (count: number) {
        totalBatches = count;
    }

    function onBatchFinished () {
        finishedBatches++;
    }

    function onCountUpdate (total: number) {
        if (apiSpinner) {
            apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
        }
    }

    const id = await fetchUserId(channel);
    const clips = await fetchClips(id, onBatchGenerated, onBatchFinished, onCountUpdate);
    const clipCount = Object.values(clips).length;

    apiSpinner.succeed('Finished API pagination.');
    apiSpinner = null;

    /**
     * Metadata phase
     */
    writeMetaFile(channel, clips);

    /**
     * Confirmation phase
     */

    const confirmation = await prompts({
        type:    'confirm',
        name:    'value',
        message: `Found ${clipCount} clips to download, download now?`,
        initial: true
    });

    if (!confirmation.value) {
        console.log('Bye!');
        process.exit(0);
    }

    /**
     * Download phase
     */

    downloadBar.start(clipCount, 0);

    const finished = await startDownload(Object.values(clips), count => downloadBar.update(count));

    downloadBar.stop();

    console.log(`Finished download of ${finished} out of ${clipCount}!`);
}

start();
