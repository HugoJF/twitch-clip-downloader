const api = require('twitch-api-v5');
const fs = require('fs')
const youtubedl = require('youtube-dl')
const pool = require('tiny-async-pool')

api.clientID = process.env.CLIENT_ID;

const debugging = process.env.DEBUG;
let finished = 0;
let clips = [];

function debug(...messages) {
    if (debugging) {
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
    pool(10, clips, downloadClip).then(result => console.log(result));
}

function fetchClips(cursor = null) {
    api.clips.top({
        channel: 'lari',
        period: 'all',
        limit: 100,
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
            fetchClips(cur);
        } else {
            console.log('Finished fetching clips, found', clips.length)
            triggerPool();
        }
    });
}

fetchClips();