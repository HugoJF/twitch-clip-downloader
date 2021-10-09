import {flags} from '@oclif/command';
import ora from 'ora';
import {SingleBar, Presets} from 'cli-progress';
import {ClipDownloader} from '../../../twitch-tools/build/src/twitch/clip-downloader';
import {BaseCommand} from '../bases/base';

export default class DownloadClip extends BaseCommand {
    private downloader!: ClipDownloader;

    private apiSpinner!: ora.Ora;
    private downloadBar!: SingleBar;

    static description = 'download clip from id';

    static examples = [
        '$ tcd download-clip <id>',
    ];

    static flags = {
        destination: flags.string({char: 'w', description: 'destination directory of downloads'}),
        save_meta: flags.boolean({char: 'm', description: 'if clips metadata should also be persisted'})
    };

    static args = [{name: 'url'}];

    async run() {
        const {args: {url}} = this.parse(DownloadClip);

        this.downloader = new ClipDownloader(url);

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} clips'
        }, Presets.shades_classic);

        await this.downloader.download();
    }
}
