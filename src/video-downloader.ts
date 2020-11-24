import fs from 'fs';
import pool                                   from "tiny-async-pool";
import {Video}                                from "./twitch";
import {logger}                               from "./logger";
import {ensureAppDirectoryExists, existsSync} from "./filesystem";
import {fragments}                            from "./video-fragments-fetcher";
import {Downloader}                           from "./downloader";
import {EventEmitter}                         from "events";
import {TransferSpeedCalculator}              from "./transfer-speed-calculator";
import {appPath}                              from "./utils";

export class VideoDownloader extends EventEmitter {
    private video: Video;

    private readonly downloadInstances: number;

    private speed: TransferSpeedCalculator;

    constructor(video: Video) {
        super();

        this.video = video;

        this.downloadInstances = parseInt(process.env.VIDEOS_PARALLEL_DOWNLOADS ?? '20');

        this.speed = new TransferSpeedCalculator;

        this.speed.on('speed', this.emit.bind(this, 'speed'));
    }

    async download() {
        logger.info(`Starting video download [${this.video.id}]: ${this.video.title}`);
        const urls = await fragments(this.video.url);

        // Video metadata
        fs.writeFileSync(appPath(`videos/${this.video.id}.meta`), JSON.stringify(this.video));

        // Fragments ID with URL
        fs.writeFileSync(appPath(`videos/${this.video.id}.fragments`), JSON.stringify(urls));

        // Fragment list for ffmpeg
        const ffmpegInput = Object.keys(urls).map(id => `file '${id}'`).join('\n');
        fs.writeFileSync(appPath(`videos/${this.video.id}.all.ts`), ffmpegInput);

        this.emit('fragments-fetched', Object.values(urls).length);
        logger.info(`Found ${Object.values(urls).length} fragments`);
        logger.verbose({urls});

        ensureAppDirectoryExists(`videos/${this.video.id}`);

        this.speed.reset();
        this.speed.on('speed', bps => logger.verbose(`Downloading2 at ${bps / 1000 / 1000 * 8}mbps`));

        await this.downloadFragments(urls);

        logger.verbose('Starting download pool');
    }

    async downloadFragments(fragmentsUrl: Dict<string>) {
        await pool<[string, string], string>(
            this.downloadInstances,
            Object.entries(fragmentsUrl),
            this.downloadFragment.bind(this)
        );
    }

    async downloadFragment(fragmentData: [string, string]) {
        const [name, url] = fragmentData;
        const path = `videos/${this.video.id}/${name}`;

        if (!existsSync(appPath(path))) {
            const downloader = new Downloader(url, path);

            downloader.on('progress', this.speed.data.bind(this.speed));

            await downloader.download();
        } else {
            logger.verbose(`Skipped download of ${url}, already exists`);
        }

        this.emit('fragment-downloaded', name);

        return name;
    }
}
