import pool                                from "tiny-async-pool";
import {Video}                             from "./twitch";
import {logger}                            from "./logger";
import {ensureDirectoryExists, existsSync} from "./filesystem";
import {fragments}                         from "./video-fragments-fetcher";
import {Downloader}                        from "./downloader";
import {EventEmitter}                      from "events";
import {TransferSpeedCalculator}           from "./transfer-speed-calculator";

export class VideoDownloader extends EventEmitter {
    private video: Video;

    private readonly downloadInstances: number;

    private speed: TransferSpeedCalculator;

    constructor(video: Video) {
        super();

        this.video = video;

        this.downloadInstances = 30;

        this.speed = new TransferSpeedCalculator;

        this.speed.on('speed', this.emit.bind(this, 'speed'));
    }

    async download() {
        logger.info(`Starting video download [${this.video.id}]: ${this.video.title}`);
        const urls = await fragments(this.video.url);

        this.emit('fragments-fetched', Object.values(urls).length);
        logger.info(`Found ${Object.values(urls).length} fragments`);
        logger.verbose({urls});

        ensureDirectoryExists(`videos/${this.video.id}`);

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

        if (!existsSync(path)) {
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
