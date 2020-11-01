import fs               from "fs";
import youtubedl        from "youtube-dl";
import pool             from "tiny-async-pool";
import {debug}          from "./utils";
import {fileExistsSync} from "./filesystem";
import {Clip}           from "./twitch";

const YOUTUBEDL_INSTANCES: number = parseInt(process.env.YOUTUBEDL_INSTANCES || '3');

function downloadClip (clip: Clip, onDownloaded: () => void) {
    return new Promise((resolve, reject) => {
        const videoPath = `clips/${clip.id}.mp4`;
        const tempVideoPath = `${videoPath}.pending`;
        if (fileExistsSync(videoPath)) {
            debug(`Skipping ${clip.id} since we already found it at ${videoPath}`);
            resolve(true);
            return;
        }
        const video = youtubedl(clip.url, [], {});
        fs.writeFileSync(`clips/${clip.id}.meta`, JSON.stringify(clip));

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
            fs.renameSync(tempVideoPath, videoPath);
            onDownloaded();
            resolve(true);
        });

        video.pipe(fs.createWriteStream(tempVideoPath));
    });
}

async function ensureClipsDirectoryExists () {
    if (!fileExistsSync('clips')) {
        debug('Could not find clips directory, creating it...');
        fs.mkdirSync('clips');
    } else {
        debug('Clips directory found!');
    }
}

export async function startDownload (clips: Clip[], onCountUpdate: (count: number) => void) {
    let finished = 0;

    await ensureClipsDirectoryExists();

    async function process (clip: Clip) {
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
