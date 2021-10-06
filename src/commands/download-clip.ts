import {Command, flags} from '@oclif/command';
import {bootLogger, Clip, ClipsDownloader, convert, Dict, instance, loadInstance, round} from 'twitch-tools';
import ora from 'ora';
import cliProgress from 'cli-progress';
import {bootLogger as bootLocalLogger, logger} from '../../src2/logger';
import {ensureConfigsAreLoaded} from '../../src2/environment';
import {ClipDownloader} from '../../../twitch-tools/build/src/twitch/clip-downloader';

// TODO
export default class DownloadClip extends Command {
    private downloader!: ClipDownloader;

    private apiSpinner!: ora.Ora;
    private downloadBar!: cliProgress.SingleBar;

    static description = 'download clip from id';

    static examples = [
        '$ tcd download-clip <id>',
    ];

    static flags = {
        workers: flags.integer({char: 'w', description: 'how many parallel clips will be downloaded'}),
        destination: flags.string({char: 'w', description: 'destination directory of downloads'}),
        save_meta: flags.boolean({char: 'm', description: 'if clips metadata should also be persisted'})
    };

    static args = [{name: 'url'}];

    async fetchClipFromId(id: string): Promise<Clip> {
        const response = await instance().api().clips({id});

        return response.request.data[0];
    }

    async run() {
        const {args: {url}, flags: {workers}} = this.parse(DownloadClip);

        await ensureConfigsAreLoaded();

        bootLogger(process.env.DEBUG === 'true');
        bootLocalLogger(process.env.DEBUG === 'DEBUG');

        await loadInstance(process.env.CLIENT_ID ?? '', process.env.CLIENT_SECRET ?? '');

        this.downloader = new ClipDownloader(url);

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading clips [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} clips'
        }, cliProgress.Presets.shades_classic);

        await this.downloader.download();
    }
}
