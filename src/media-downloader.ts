import fs                                  from "fs";
import pool                                from "tiny-async-pool";
import {ensureDirectoryExists, existsSync} from "./filesystem";
import {Clip, Video}                       from "./twitch";
import {YOUTUBEDL_INSTANCES}               from "./configs";
// @ts-ignore
import YoutubeDlWrap                       from "youtube-dl-wrap";
import {fragments}                         from "./video-fragments-fetcher";
import {download}                          from "./downloader";
import {logger}                            from "./logger";
import {EventEmitter}                      from "events";

const youtubeDlWrap = new YoutubeDlWrap("./bin/youtube-dl.exe");

function downloadMedia(url: string, name: string, directory: string, onDownloaded: () => void) {
    return new Promise((resolve, reject) => {
        logger.info(`Downloading media ${name} at directory ${directory} from URL: ${url}`);
        const mediaPath = `${directory}/${name}.mp4`;
        const tempVideoPath = `${mediaPath}.pending`;
        if (existsSync(mediaPath)) {
            logger.verbose(`Skipping ${name} since we already found it at ${mediaPath}`);
            resolve(true);
            return;
        }
        let downloader = youtubeDlWrap.execStream([url, "-f", "best"]);

        downloader.on("progress", (progress: any) =>
            logger.verbose(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta));

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

export async function startVideosDownload(videos: Video[]) {
    ensureDirectoryExists('videos');

    logger.verbose('Starting video download');
    for (let video of videos) {
        logger.info(`Download video ${video.id}: ${video.title}`);
        const fragmentDownloadInstances = 50;
        const id = video.id;
        const urls = await fragments(video.url);
        const entries = Object.entries(urls);

        logger.info(`Found ${Object.values(urls).length} fragments`);
        logger.verbose({urls});

        ensureDirectoryExists(`videos/${id}`);

        logger.verbose('Starting download pool');
        const frags = await pool<typeof entries[0], string>(
            fragmentDownloadInstances,
            entries,
            async ([name, url]) => {
                const path = `videos/${id}/${name}`;

                if (!existsSync(path)) {
                    await download(url, path);
                } else {
                    logger.verbose(`Skipped download of ${url}, already exists`);
                }

                return name;
            });
    }
}
