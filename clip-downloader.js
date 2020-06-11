const fs = require('fs');
const {debug} = require("./utils");
const youtubedl = require('youtube-dl');
const pool = require('tiny-async-pool');

const YOUTUBEDL_INSTANCES = process.env.YOUTUBEDL_INSTANCES || 3;

function downloadClip(clip, onDownloaded) {
    return new Promise((res, rej) => {
        const video = youtubedl(clip.url);

        video.on('info', (info) => {
            debug('Clip download started', clip.id);
            debug('Filename:', info._filename);
            debug('Size:', info.size)
        });

        video.on('error', err => {
            console.error(err);
        });

        video.on('end', () => {
            onDownloaded();
            res(true);
        });

        video.pipe(fs.createWriteStream(`clips/${clip.id}.mp4`));
        fs.writeFileSync(`clips/${clip.id}.meta`, JSON.stringify(clip));
    })
}

async function startDownload(clips, onCountUpdate) {
    let finished = 0;

    async function process(clip) {
        await downloadClip(clip, () => {
            finished++;
            if (onCountUpdate) {
                onCountUpdate(finished)
            }
        });
    }

    await pool(YOUTUBEDL_INSTANCES, clips, process);

    return finished;
}

module.exports = {downloadClips: startDownload};