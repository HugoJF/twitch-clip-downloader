import pool                                              from 'tiny-async-pool';
import {EventEmitter}                                           from 'events';
import {ensureAppDirectoryExists, existsSync, write, writeFile} from './filesystem';
import {TransferSpeedCalculator}                                from './transfer-speed-calculator';
import {ClipFetcher}                                     from './clip-fetcher';
import {Downloader}                                      from './downloader';
import {getClipUrl}                                      from './clip-url-fetcher';
import {appPath}                                         from './utils';
import {logger}                                          from './logger';

type ExtraOptions = {
    parallelDownloads?: number;
}

export class ClipsDownloader extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    public readonly clipsFetcher: ClipFetcher;
    public readonly speed: TransferSpeedCalculator;

    private readonly parallelDownloads: number;

    constructor(channel: string, userId: string, options: ExtraOptions = {}) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.clipsFetcher = new ClipFetcher(this.userId);
        this.speed = new TransferSpeedCalculator;

        this.parallelDownloads = options.parallelDownloads ?? 20;
    }

    fetchClips(): Promise<Dict<Clip>> {
        return this.clipsFetcher.start();
    }

    writeMetaFile = async (channel: string, data: any): Promise<void> => {
        logger.info('Writing meta data to disk');
        return write(appPath(`${channel}.meta`), JSON.stringify(data));
    };

    async downloadClips(clips: Dict<Clip>): Promise<void> {
        const clipCount = Object.values(clips).length;

        ensureAppDirectoryExists('clips');

        await pool(
            this.parallelDownloads,
            Object.values(clips),
            this.downloadClip.bind(this)
        );

        logger.info(`Finished download of ${clipCount} clips!`);
    }

    async downloadClip(clip: Clip): Promise<void> {
        const mp4Path = `clips/${clip.id}.mp4`;
        const metaPath = `clips/${clip.id}.meta`;

        if (existsSync(appPath(mp4Path))) {
            logger.verbose(`Clip ${clip.title} found at ${appPath(mp4Path)}`);

            return;
        }

        const promises: Promise<any>[] = [];
        const url = await getClipUrl(clip);

        // TODO: writing individual meta file
        promises.push(writeFile(appPath(metaPath), JSON.stringify(clip)));

        if (url) {
            const downloader = new Downloader(url, mp4Path);

            downloader.on('progress', bytes => {
                this.speed.data(bytes);
            });

            logger.verbose(`Downloading clip ${clip.title}`);
            promises.push(downloader.download());
        }

        await Promise.all(promises);
    }
}
