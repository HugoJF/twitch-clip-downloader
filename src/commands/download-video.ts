import {flags} from '@oclif/command';
import {instance, Video, VideoDownloader} from 'twitch-tools';
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

    fetchVideoById(id: string): Video {
        // @ts-ignore FIXME
        const videos = instance().api().videos({id});

        return videos[0];
    }

    async run() {
        const {args: {channel}, flags: {workers}} = this.parse(DownloadClips);

        const video = this.fetchVideoById(channel);

        this.downloader = new VideoDownloader(video, {
            parallelDownloads: workers,
        });

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} clips'
        }, cliProgress.Presets.shades_classic);

        await this.downloader.download();
    }
}
