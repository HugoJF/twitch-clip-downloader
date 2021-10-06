import {Command, flags} from '@oclif/command';
import {bootLogger, Clip, ClipsDownloader, convert, Dict, instance, loadInstance, round} from 'twitch-tools';
import ora from 'ora';
import cliProgress from 'cli-progress';
import {bootLogger as bootLocalLogger, logger} from '../../src2/logger';
import {ensureConfigsAreLoaded} from '../../src2/environment';

export default class DownloadClips extends Command {
    private downloader!: ClipsDownloader;

    private apiSpinner!: ora.Ora;
    private downloadBar!: cliProgress.SingleBar;

    static description = 'downloads clips from channel name';

    static examples = [
        '$ tcd download-clips <channel>',
    ];

    static flags = {
        workers: flags.integer({char: 'w', description: 'how many parallel clips will be downloaded'}),
        destination: flags.string({char: 'w', description: 'destination directory of downloads'}),
        save_meta: flags.boolean({char: 'm', description: 'if clips metadata should also be persisted'})
    };

    static args = [{name: 'channel'}];

    async fetchUserId(name: string) {
        const user = await instance().api().users({login: name});

        return user.data.data[0].id;
    }

    async downloadClips(clips: Dict<Clip>): Promise<void> {
        const clipCount = Object.values(clips).length;

        // Download phase
        this.downloadBar.start(clipCount, 0);

        this.downloadBar.update({speed: 0});

        // TODO: ClipsDownloader needs update
        this.downloader.speed.on('speed', speed => {
            this.downloadBar.update({
                speed: round(convert(speed).Bps.to.Mbps(), 2)
            });
        });

        this.downloader.on('clip-downloaded', () => {
            this.downloadBar.increment();
        });

        await this.downloader.downloadClips(clips);

        this.downloadBar.stop();

        logger.info(`Finished download of ${clipCount} clips!`);
    }

    async start(): Promise<void> {
        const clips = await this.fetchClips();

        await this.downloadClips(clips);
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

    async run() {
        const {args: {channel}, flags: {workers}} = this.parse(DownloadClips);

        await ensureConfigsAreLoaded();

        bootLogger(process.env.DEBUG === 'true');
        bootLocalLogger(process.env.DEBUG === 'DEBUG');

        await loadInstance(process.env.CLIENT_ID ?? '', process.env.CLIENT_SECRET ?? '');

        const id = await this.fetchUserId(channel);

        this.downloader = new ClipsDownloader(channel, id, {
            parallelDownloads: workers ?? 20,
        });

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} clips'
        }, cliProgress.Presets.shades_classic);

        await this.start();
    }
}
