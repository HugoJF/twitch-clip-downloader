import fs                    from "fs";
import youtubedl             from "youtube-dl";
import pool                  from "tiny-async-pool";
import {debug}                             from "./utils";
import {ensureDirectoryExists, existsSync} from "./filesystem";
import {Clip, Video}                       from "./twitch";
import {YOUTUBEDL_INSTANCES}               from "./configs";

function downloadMedia (url: string, name: string, directory: string, onDownloaded: () => void) {
    return new Promise((resolve, reject) => {
        debug(`Downloading media ${name} at directory ${directory} from URL: ${url}`);
        const mediaPath = `${directory}/${name}.mp4`;
        const tempVideoPath = `${mediaPath}.pending`;
        if (existsSync(mediaPath)) {
            debug(`Skipping ${name} since we already found it at ${mediaPath}`);
            resolve(true);
            return;
        }
        const downloader = youtubedl(url, [], {});

        downloader.on('info', (info) => {
            debug('Clip download started', name);
            debug('Filename:', info._filename);
            debug('Size:', info.size);
        });

        downloader.on('error', err => {
            console.error(err);
            reject(err);
        });

        downloader.on('end', () => {
            fs.renameSync(tempVideoPath, mediaPath);
            onDownloaded();
            resolve(true);
        });

        downloader.pipe(fs.createWriteStream(tempVideoPath));
    });
}

export async function startClipsDownload (clips: Clip[], onCountUpdate: (count: number) => void) {
    let finished = 0;

    ensureDirectoryExists('clips');

    async function process (clip: Clip) {
        fs.writeFileSync(`clips/${clip.id}.meta`, JSON.stringify(clip));

        await downloadMedia(clip.url, clip.id, 'clips', () => {
            finished++;
            if (onCountUpdate) {
                onCountUpdate(finished);
            }
        });
    }

    await pool(YOUTUBEDL_INSTANCES, clips, process);

    return finished;
}

export async function startVideosDownload (videos: Video[], onCountUpdate: (count: number) => void) {
    let finished = 0;

    ensureDirectoryExists('videos');

    async function process (video: Video) {
        fs.writeFileSync(`videos/${video.id}.meta`, JSON.stringify(video));

        await downloadMedia(video.url, video.id, 'videos', () => {
            finished++;
            if (onCountUpdate) {
                onCountUpdate(finished);
            }
        });
    }

    await pool(YOUTUBEDL_INSTANCES, videos, process);

    return finished;
}
