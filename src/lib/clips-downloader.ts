import pool                                              from 'tiny-async-pool';
import {EventEmitter}                                    from 'events';
import {ensureAppDirectoryExists, existsSync, writeFile} from './filesystem';
import {TransferSpeedCalculator}                         from './transfer-speed-calculator';
import {ClipFetcher}                                     from './clip-fetcher';
import {Downloader}                                      from './downloader';
import {getClipUrl}                                      from './clip-url-fetcher';
import {appPath}                                         from './utils';
import {logger}                                          from './logger';

export class ClipsDownloader extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    public readonly clipsFetcher: ClipFetcher;
    public readonly speed: TransferSpeedCalculator;

    private readonly downloadInstances: number;

    constructor(channel: string, userId: string) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.clipsFetcher = new ClipFetcher(this.userId);
        this.speed = new TransferSpeedCalculator;

        this.downloadInstances = parseInt(process.env.CLIPS_PARALLEL_DOWNLOADS ?? '20');
    }

    fetchClips(): Promise<Dict<Clip>> {
        return this.clipsFetcher.start();
    }

    async downloadClips(clips: Dict<Clip>): Promise<void> {
        const clipCount = Object.values(clips).length;

        ensureAppDirectoryExists('clips');

        await pool(
            this.downloadInstances,
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
