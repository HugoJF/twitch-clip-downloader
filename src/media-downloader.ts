import fs                                  from "fs";
import pool                                from "tiny-async-pool";
import {debug}                                     from "./utils";
import {ensureDirectoryExists, exists, existsSync} from "./filesystem";
import {Clip, Video}                               from "./twitch";
import {YOUTUBEDL_INSTANCES}               from "./configs";
// @ts-ignore
import YoutubeDlWrap                       from "youtube-dl-wrap";
import {fragments}                         from "./video-fragments-fetcher";
import {download}                          from "./downloader";

const youtubeDlWrap = new YoutubeDlWrap("./bin/youtube-dl.exe");

function downloadMedia(url: string, name: string, directory: string, onDownloaded: () => void) {
    return new Promise((resolve, reject) => {
        debug(`Downloading media ${name} at directory ${directory} from URL: ${url}`);
        const mediaPath = `${directory}/${name}.mp4`;
        const tempVideoPath = `${mediaPath}.pending`;
        if (existsSync(mediaPath)) {
            debug(`Skipping ${name} since we already found it at ${mediaPath}`);
            resolve(true);
            return;
        }
        let downloader = youtubeDlWrap.execStream([url, "-f", "best"]);

        downloader.on("progress", (progress: any) =>
            debug(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta));

        downloader.on('error', (err: any) => {
            console.error(err);
            reject(err);
        });

        downloader.on('close', () => {
            fs.renameSync(tempVideoPath, mediaPath);
            onDownloaded();
            resolve(true);
        });

        downloader.pipe(fs.createWriteStream(tempVideoPath));
    });
}

export async function startClipsDownload(clips: Clip[], onCountUpdate: (count: number) => void) {
    let finished = 0;

    ensureDirectoryExists('clips');

    async function process(clip: Clip) {
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

export async function startVideosDownload(videos: Video[], onCountUpdate: (count: number) => void) {
    let finished = 0;

    ensureDirectoryExists('videos');

    debug('Starting video download');
    for (let video of videos) {
        debug(`Download video ${video.id}: ${video.title}`);
        const id = video.id;
        const urls = await fragments(video.url);
        const entries = Object.entries(urls);

        debug(`Found ${Object.values(urls).length} fragments`);
        debug(urls);

        ensureDirectoryExists(`videos/${id}`);

        debug('Starting download pool');
        await pool<typeof entries[0], string>(50, entries, async ([name, url]) => {
            const path = `videos/${id}/${name}`;

            if (!existsSync(path)) {
                await download(url, path);
            } else {
                debug(`Skipped download of ${url}, already exists`);
            }

            return name;
        });
    }

    return finished;
}