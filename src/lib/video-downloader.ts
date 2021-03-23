import fs                                     from 'fs';
import pool                                   from 'tiny-async-pool';
import ffmpeg                                 from 'fluent-ffmpeg';
import {EventEmitter}                         from 'events';
import {ensureAppDirectoryExists, existsSync} from './filesystem';
import {appPath, bpsToHuman, videosPath}      from './utils';
import {TransferSpeedCalculator}              from './transfer-speed-calculator';
import {Downloader}                           from './downloader';
import {fragments}                            from './video-fragments-fetcher';
import {logger}                               from './logger';
import {Video}                                from './twitch';

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

    transcode(): Promise<void> {
        return new Promise((res, rej) => {
            logger.info(`Started video ${this.video.id} transcode`);
            ffmpeg()
                .input(appPath(`videos/${this.video.id}.all.ts`))
                .inputOption('-safe 0')
                .inputFormat('concat')
                .addOption('-bsf:a', 'aac_adtstoasc')
                .videoCodec('copy')
                .on('start', logger.verbose.bind(logger))
                .on('progress', logger.verbose.bind(logger))
                .on('stderr', logger.error.bind(logger))
                .on('error', (e) => {
                    logger.error.bind(logger);
                    rej(e);
                })
                .on('end', () => {
                    logger.verbose(`Transcode of ${this.video.id} finished`);
                    res();
                })
                .save(appPath(`videos/${this.video.id}.mp4`));

            logger.info(`Finished video ${this.video.id} transcode`);
        });

    }

    async download(): Promise<void> {
        logger.info(`Starting video download [${this.video.id}]: ${this.video.title}`);
        const urls = await fragments(this.video.url);

        // Video metadata
        fs.writeFileSync(videosPath(`${this.video.id}.meta`), JSON.stringify(this.video));

        // Fragments ID with URL
        fs.writeFileSync(videosPath(`${this.video.id}.fragments`), JSON.stringify(urls));

        // Fragment list for ffmpeg
        const ffmpegInput = Object.keys(urls).map(id => {
            const fragPath = videosPath(`${this.video.id}/${id}'`);

            return `file '${fragPath}'`;
        }).join('\n');
        fs.writeFileSync(videosPath(`${this.video.id}.all.ts`), ffmpegInput);

        this.emit('fragments-fetched', Object.values(urls).length);
        logger.info(`Found ${Object.values(urls).length} fragments`);
        logger.verbose({urls});

        ensureAppDirectoryExists(`videos/${this.video.id}`);

        this.speed.reset();
        this.speed.on('speed', bps => logger.verbose(`Downloading at ${bpsToHuman(bps)}`));

        await this.downloadFragments(urls);

        logger.verbose('Starting download pool');
    }

    async downloadFragments(fragmentsUrl: Dict<string>): Promise<void> {
        await pool<[string, string], string>(
            this.downloadInstances,
            Object.entries(fragmentsUrl),
            this.downloadFragment.bind(this)
        );
    }

    async downloadFragment(fragmentData: [string, string]): Promise<string> {
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
