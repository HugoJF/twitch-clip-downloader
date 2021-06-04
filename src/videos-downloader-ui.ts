import ora                                                                                                  from 'ora';
import prompts                                                                                              from 'prompts';
import cliProgress                                                                                          from 'cli-progress';
import {EventEmitter}                                                                                       from 'events';
import {ChatDownloader, convert, Dict, ensureAppDirectoryExists, Video, VideoDownloader, VideosDownloader,} from 'twitch-tools';
import {logger}                                                                                             from './logger';

export class VideosDownloaderUi extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    private readonly videosDownloader: VideosDownloader;

    private fragmentDownloadInstances: number;

    private apiSpinner: ora.Ora;
    private downloadBar: cliProgress.SingleBar;

    constructor(channel: string, userId: string) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.videosDownloader = new VideosDownloader(channel, userId, {
            parallelDownloads: parseInt(process.env.VIDEOS_PARALLEL_DOWNLOADS ?? '50'),
        });

        this.fragmentDownloadInstances = 50;

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({
            format: 'Downloading video [{video}] | [{bar}] | {percentage}% | Speed: {speed}Mbps | ETA: {eta}s | {value}/{total} fragments'
        }, cliProgress.Presets.shades_classic);
    }

    async start(): Promise<void> {
        const videos = await this.fetchVideos();

        await this.downloadVideos(videos);
    }

    private async fetchVideos() {
        // API fetching phase
        const totalBatches = 0;
        const finishedBatches = 0;

        this.apiSpinner.start();

        // TODO: type me
        // @ts-ignore
        this.videosDownloader.videoFetcher.on('video', ({videos}) => {
            this.apiSpinner.text = `Paginating API, found ${Object.values(videos).length} videos, ${finishedBatches}/${totalBatches} please wait...`;
        });

        const videos = await this.videosDownloader.fetchVideos();

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
            await Promise.all([
                this.downloadVideo(video),
                this.downloadChat(video)
            ]);
        }
    }

    private async downloadVideo(video: Video) {
        const videoDownloader = new VideoDownloader(video);

        videoDownloader.on('fragments-fetched', fragments => {
            this.downloadBar.start(fragments, 0, {
                video: video.title,
            });
        });

        videoDownloader.on('fragment-downloaded', () => {
            this.downloadBar.increment();
        });

        videoDownloader.on('speed', speed => {
            this.downloadBar.update({
                speed: convert(speed).Bps.to.Mbps(),
            });
        });

        await videoDownloader.download();

        await videoDownloader.transcode();

        this.downloadBar.stop();
    }

    private async downloadChat(video: Video) {
        const chatDownloader = new ChatDownloader(video);

        await chatDownloader.download();
    }
}
