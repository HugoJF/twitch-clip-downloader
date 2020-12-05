import ora                        from 'ora';
import prompts                    from 'prompts';
import cliProgress                from 'cli-progress';
import {Video}                    from './twitch';
import {logger}                   from './logger';
import {ensureAppDirectoryExists} from './filesystem';
import {EventEmitter}             from 'events';
import {VideoDownloader}          from './video-downloader';
import {VideosFetcher}            from './videos-fetcher';

export class VideosDownloader extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    private fragmentDownloadInstances: number;

    private apiSpinner: ora.Ora;
    private downloadBar: cliProgress.SingleBar;

    constructor(channel: string, userId: string) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.fragmentDownloadInstances = 50;

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading video [{video}] | [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} fragments'
        }, cliProgress.Presets.shades_classic);
    }

    private async fetchVideos() {
        // API fetching phase
        const totalBatches = 0;
        const finishedBatches = 0;

        this.apiSpinner.start();

        const videoFetcher = new VideosFetcher(this.userId);

        // TODO: type me
        // @ts-ignore
        videoFetcher.on('video', ({videos}) => {
            this.apiSpinner.text = `Paginating API, found ${Object.values(videos).length} videos, ${finishedBatches}/${totalBatches} please wait...`;
        });

        const videos = await videoFetcher.fetchVideos();

        this.apiSpinner.succeed('Finished API pagination.');
        this.apiSpinner.clear();

        // Metadata phase
        // TODO: migrate to videos
        // writeMetaFile(channel, Object.values(videos));

        return videos;
    }

    private async downloadVideos(videos: Dict<Video>) {
        // Confirmation phase
        const videoCount = Object.values(videos).length;
        const confirmation = await prompts({
            type: 'confirm',
            name: 'value',
            message: `Found ${videoCount} videos to download, download now?`,
            initial: true
        });

        if (!confirmation.value) {
            console.log('Bye!');
            process.exit(0);
        }

        ensureAppDirectoryExists('videos');

        logger.verbose('Starting videos download');
        for (const video of Object.values(videos)) {
            await this.downloadVideo(video);
        }
    }

    private async downloadVideo(video: Video) {
        const videoDownloader = new VideoDownloader(video);

        videoDownloader.on('fragments-fetched', fragments => {
            this.downloadBar.start(fragments, 0, {
                video: video.title,
            });
        });

        videoDownloader.on('fragment-downloaded', name => {
            this.downloadBar.increment();
        });

        videoDownloader.on('speed', speed => {
            this.downloadBar.update({
                speed: speed / 1000 / 1000 * 8,
            });
        });

        await videoDownloader.download();

        await videoDownloader.transcode();

        this.downloadBar.stop();
    }


    async start() {
        const videos = await this.fetchVideos();

        await this.downloadVideos(videos);
    }
}
