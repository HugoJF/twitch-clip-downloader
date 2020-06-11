const {ensureConfigsAreLoaded} = require('./lib/cli/environment');
const {downloadClips} = require('./clip-downloader');
const {fetchClips} = require('./clip-fetcher');
const {load, api} = require('./api');
const cliProgress = require('cli-progress');
const prompts = require('prompts');
const ora = require('ora');


let apiSpinner;
let downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function fetchUserId(name) {
    let user = await api().users(name);

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();

    const response = await prompts({
        type: 'text',
        name: 'channel',
        message: 'What channel do you want to download clips from?',
        validate: value => value.match(/\.tv|\//g) ? 'Usernames only (without URLs)' : true
    });

    await load();

    /**
     * API fetching phase
     */

    let totalBatches = 0;
    let finishedBatches = 0;
    if (!apiSpinner) {
        apiSpinner = ora('Paginating API, please wait...').start();
    }

    function onBatchGenerated(count) {
        totalBatches = count;
    }

    function onBatchFinished() {
        finishedBatches++;
    }

    function onCountUpdate(total) {
        apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
    }

    let id = await fetchUserId(response.channel);
    let clips = await fetchClips(id, onBatchGenerated, onBatchFinished, onCountUpdate);
    let clipCount = Object.values(clips).length;

    apiSpinner.succeed(`Finished API pagination.`);
    apiSpinner = null;

    /**
     * Confirmation phase
     */

    const confirmation = await prompts({
        type: 'confirm',
        name: 'value',
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

    let finished = await downloadClips(Object.values(clips), count => downloadBar.update(count));

    downloadBar.stop();

    console.log(`Finished download of ${finished} out of ${clipCount}!`);
}

start();
