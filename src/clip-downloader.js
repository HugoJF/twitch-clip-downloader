const fs        = require('fs');
const youtubedl = require('youtube-dl');
const pool      = require('tiny-async-pool');

const { debug } = require('./utils');

const YOUTUBEDL_INSTANCES = process.env.YOUTUBEDL_INSTANCES || 3;

function downloadClip (clip, onDownloaded) {
    return new Promise((resolve, reject) => {
        const video = youtubedl(clip.url);

        video.on('info', (info) => {
            debug('Clip download started', clip.id);
            debug('Filename:', info._filename);
            debug('Size:', info.size);
        });

        video.on('error', err => {
            console.error(err);
            reject(err);
        });

        video.on('end', () => {
            onDownloaded();
            resolve(true);
        });

        video.pipe(fs.createWriteStream(`clips/${clip.id}.mp4`));
        fs.writeFileSync(`clips/${clip.id}.meta`, JSON.stringify(clip));
    });
}

async function startDownload (clips, onCountUpdate) {
    let finished = 0;

    async function process (clip) {
        await downloadClip(clip, () => {
            finished++;
            if (onCountUpdate) {
                onCountUpdate(finished);
            }
        });
    }

    await pool(YOUTUBEDL_INSTANCES, clips, process);

    return finished;
}

module.exports = { downloadClips: startDownload };
