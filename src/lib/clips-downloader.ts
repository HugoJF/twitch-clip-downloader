import ora                                               from 'ora';
import pool                                              from 'tiny-async-pool';
import prompts                                           from 'prompts';
import cliProgress                                       from 'cli-progress';
import {EventEmitter}                                    from 'events';
import {ensureAppDirectoryExists, existsSync, writeFile} from './filesystem';
import {TransferSpeedCalculator}                         from './transfer-speed-calculator';
import {writeMetaFile}                                   from './meta';
import {ClipFetcher}                                     from './clip-fetcher';
import {Downloader}                                      from './downloader';
import {getClipUrl}              from './clip-url-fetcher';
import {appPath, convert, round} from './utils';
import {logger}                  from './logger';

export class ClipsDownloader extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    private downloadInstances: number;

    private speed: TransferSpeedCalculator;
    private apiSpinner: ora.Ora;
    private downloadBar: cliProgress.SingleBar;

    constructor(channel: string, userId: string) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.downloadInstances = parseInt(process.env.CLIPS_PARALLEL_DOWNLOADS ?? '20');

        this.speed = new TransferSpeedCalculator;
        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} clips'
        }, cliProgress.Presets.shades_classic);
    }

    private async fetchClips(): Promise<Dict<Clip>> {
        // API fetching phase
        let totalBatches = 0;
        let finishedBatches = 0;

        this.apiSpinner.start();

        const clipsFetcher = new ClipFetcher(this.userId);

        clipsFetcher.on('clip-count', total => {
            this.apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
        });

        clipsFetcher.on('batch-generated', count => totalBatches = count);

        clipsFetcher.on('batch-finished', () => finishedBatches++);

        const clips = await clipsFetcher.start();

        this.apiSpinner.succeed('Finished API pagination.');
        this.apiSpinner.clear();

        /**
         * Metadata phase
         */
        writeMetaFile(this.channel, Object.values(clips));

        return clips;
    }

    async downloadClips(clips: Dict<Clip>): Promise<void> {
        const clipCount = Object.values(clips).length;

        // Confirmation phase
        const confirmation = await prompts({
            type: 'confirm',
            name: 'value',
            message: `Found ${clipCount} clips to download, download now?`,
            initial: true
        });

        if (!confirmation.value) {
            console.log('Bye!');
            process.exit(0);
        }

        ensureAppDirectoryExists('clips');

        // Download phase
        this.downloadBar.start(clipCount, 0);

        this.speed.on('speed', speed => {
            this.downloadBar.update({
                speed: round(convert(speed).Bps.to.Mbps(), 2)
            });
        });

        await pool(
            this.downloadInstances,
            Object.values(clips),
            this.downloadClip.bind(this)
        );

        this.downloadBar.stop();

        console.log(`Finished download of ${clipCount} clips!`);
    }

    async downloadClip(clip: Clip): Promise<void> {
        const mp4Path = `clips/${clip.id}.mp4`;
        const metaPath = `clips/${clip.id}.meta`;

        if (!existsSync(appPath(mp4Path))) {
            const url = await getClipUrl(clip);

            writeFile(appPath(metaPath), JSON.stringify(clip));

            if (url) {
                const downloader = new Downloader(url, mp4Path);

                downloader.on('progress', bytes => {
                    this.speed.data(bytes);
                });

                logger.verbose(`Downloading clip ${clip.title}`);
                await downloader.download();
            }
        } else {
            logger.verbose(`Clip ${clip.title} found at ${appPath(mp4Path)}`);
        }

        this.downloadBar.increment();
    }

    async start(): Promise<void> {
        const clips = await this.fetchClips();

        await this.downloadClips(clips);
    }
}
