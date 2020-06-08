const api = require('twitch-api-v5');
const fs = require('fs')
const youtubedl = require('youtube-dl')
const pool = require('tiny-async-pool')
const prompts = require('prompts');

api.clientID = process.env.CLIENT_ID;

const DEBUGGING = process.env.DEBUG;
const PAGINATION_SIZE = process.env.PAGINATION_SIZE;
const YOUTUBEDL_INSTANCES = process.env.YOUTUBEDL_INSTANCES;

let finished = 0;
let clips = [];

function debug(...messages) {
    if (DEBUGGING) {
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
            console.log(`Finished ${++finished} out of ${clips.length}`)
            res(true);
        })

        video.pipe(fs.createWriteStream(`clips/${clip.slug}.mp4`))
        fs.writeFileSync(`clips/${clip.slug}.meta`, JSON.stringify(clip));
    })
}

function triggerPool() {
    pool(YOUTUBEDL_INSTANCES, clips, downloadClip).then(result => console.log(result));
}

async function fetchClips(channel, cursor = null) {
    api.clips.top({
        channel: channel,
        period: 'all',
        limit: PAGINATION_SIZE,
        cursor: cursor
    }, (err, res) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        clips = [...clips, ...res.clips];

        let cur = res._cursor;
        if (cur) {
            console.log('Fetching more at cursor', cur, 'clips count: ', clips.length);
            fetchClips(channel, cur);
        } else {
            console.log('Finished fetching clips, found', clips.length)
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
    const responses = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Can you confirm?',
        initial: true
    });

    fetchClips(response.channel);
}

start();