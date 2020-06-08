const api = require('twitch-api-v5');
const fs = require('fs')
const youtubedl = require('youtube-dl')
const pool = require('tiny-async-pool')
const prompts = require('prompts');
const ora = require('ora');
const cliProgress = require('cli-progress');

api.clientID = process.env.CLIENT_ID;

const DEBUGGING = process.env.DEBUG;
const PAGINATION_SIZE = process.env.PAGINATION_SIZE;
const YOUTUBEDL_INSTANCES = process.env.YOUTUBEDL_INSTANCES;

let apiSpinner;
let downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

let finished = 0;
let clips = [];

function debug(...messages) {
    if (DEBUGGING == true) {
        console.log(...messages);
    }
}

function downloadClip(clip) {
    return new Promise((res, rej) => {
        const video = youtubedl(clip.url)
         
        video.on('info', function(info) {
          debug('Clip download started', clip.slug)
          debug('Filename:', info._filename)
          debug('Size:', info.size)
        })
         
        video.on('end', function () {
            downloadBar.update(++finished);
            res(true);
        })

        video.pipe(fs.createWriteStream(`clips/${clip.slug}.mp4`))
        fs.writeFileSync(`clips/${clip.slug}.meta`, JSON.stringify(clip));
    })
}

function triggerPool() {
    pool(YOUTUBEDL_INSTANCES, clips, downloadClip).then(result => {
        downloadBar.stop();
        console.log('Finished clip download!');
        console.log(`Errors: ${clips.length - finished}`);
    });
}

async function fetchClips(channel, cursor = null) {
    if (!apiSpinner) {
        apiSpinner = ora('Paginating API, please wait...').start();
    }

    api.clips.top({
        channel: channel,
        period: 'all',
        limit: PAGINATION_SIZE,
        cursor: cursor
    }, async (err, res) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        const {clips: _clips, _cursor} = res;

        clips = [...clips, ..._clips];

        if (_cursor) {
            apiSpinner.text = `Found ${clips.length} clips, please wait...`

            fetchClips(channel, _cursor);
        } else {
            apiSpinner.succeed(`Finished API pagination.`);
            apiSpinner = null;

            const response = await prompts({
                type: 'confirm',
                name: 'value',
                message: `Found ${clips.length} clips to download, download now?`,
                initial: true
            });
            
            if (!response.value) {
                console.log('Bye!');
                process.exit(0);
            }
            downloadBar.start(clips.length, 0);
            triggerPool();
        }
    });
}

async function start() {
    const response = await prompts({
        type: 'text',
        name: 'channel',
        message: 'What channel do you want to download clips from?',
        validate: value => value.match(/\.tv|\//g) ? 'Usernames only (without URLs)' : true
    });

    fetchClips(response.channel);
}

start();