import {flags} from '@oclif/command';
import {convert, round, VideoDownloader} from 'twitch-tools';
import ora from 'ora';
import cliProgress from 'cli-progress';
import {BaseCommand} from '../bases/base';

export default class DownloadClips extends BaseCommand {
    private downloader!: VideoDownloader;

    private apiSpinner!: ora.Ora;
    private downloadBar!: cliProgress.SingleBar;

    static description = 'Downloads a single clip from an URL';

    static examples = [
        '$ tcd download-video <id>',
    ];

    static flags = {
        workers: flags.integer({char: 'w', description: 'how many parallel clips will be downloaded'}),
        destination: flags.string({char: 'w', description: 'destination directory of downloads'}),
    };

    static args = [{name: 'id'}];

    async run() {
        const {args: {id}, flags: {workers}} = this.parse(DownloadClips);

        this.downloader = new VideoDownloader(id, {
            parallelDownloads: workers,
        });

        this.apiSpinner = ora('Downloading chat, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} fragments'
        }, cliProgress.Presets.shades_classic);

        await this.downloader.resolveVideo();

        let pages = 0;
        this.apiSpinner.start();
        this.downloader.on('page-downloaded', () => this.apiSpinner.text = `Downloading chat, ${++pages} pages downloaded, please wait...`);
        await this.downloader.downloadChat();
        this.apiSpinner.stop();

        this.downloader.on('fragments-fetched', count => this.downloadBar.start(count, 0, {speed: 0}));
        this.downloader.on('fragment-downloaded', () => this.downloadBar.increment());
        this.downloader.on('speed', speed => this.downloadBar.update({speed: round(convert(speed).Bps.to.Mbps(), 2)}));

        await this.downloader.download();
        this.downloadBar.stop();
    }
}
