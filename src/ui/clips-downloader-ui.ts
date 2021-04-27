import ora               from 'ora';
import prompts           from 'prompts';
import cliProgress       from 'cli-progress';
import {EventEmitter}    from 'events';
import {ClipsDownloader} from '../lib/clips-downloader';
import {convert, round}  from '../lib/utils';
import {logger}          from '../lib/logger';

export class ClipsDownloaderUi extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    private readonly downloader: ClipsDownloader;

    private readonly downloadInstances: number;

    private apiSpinner: ora.Ora;
    private downloadBar: cliProgress.SingleBar;

    constructor(channel: string, userId: string) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.downloader = new ClipsDownloader(channel, userId);

        this.downloadInstances = parseInt(process.env.CLIPS_PARALLEL_DOWNLOADS ?? '20');

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

        this.downloader.clipsFetcher.on('clip-count', total => {
            this.apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
        });

        this.downloader.clipsFetcher.on('batch-generated', count => totalBatches = count);

        this.downloader.clipsFetcher.on('batch-finished', () => finishedBatches++);

        const clips = await this.downloader.fetchClips();

        this.apiSpinner.succeed('Finished API pagination.');
        this.apiSpinner.clear();

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

        // Download phase
        this.downloadBar.start(clipCount, 0);

        this.downloader.speed.on('speed', speed => {
            this.downloadBar.update({
                speed: round(convert(speed).Bps.to.Mbps(), 2)
            });
        });

        await this.downloader.downloadClips(clips);

        this.downloadBar.stop();

        logger.info(`Finished download of ${clipCount} clips!`);
    }

    async start(): Promise<void> {
        const clips = await this.fetchClips();

        await this.downloadClips(clips);
    }
}
