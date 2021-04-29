import {EventEmitter}             from 'events';
import {ensureAppDirectoryExists} from './filesystem';
import {VideoDownloader}          from './video-downloader';
import {ChatDownloader}           from './chat-downloader';
import {VideosFetcher}            from './videos-fetcher';
import {logger}                   from './logger';

type ExtraOptions = {
    parallelDownloads?: number;
}

export class VideosDownloader extends EventEmitter {
    private readonly channel: string;
    private readonly userId: string;

    public readonly videoFetcher: VideosFetcher;

    private fragmentDownloadInstances: number;

    private options: ExtraOptions;

    constructor(channel: string, userId: string, options: ExtraOptions) {
        super();

        this.channel = channel;
        this.userId = userId;

        this.videoFetcher = new VideosFetcher(this.userId);

        this.fragmentDownloadInstances = 50;

        this.options = options;
    }

    fetchVideos() {
        return this.videoFetcher.fetchVideos();
    }

    private async downloadVideos(videos: Dict<Video>) {
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
        const videoDownloader = new VideoDownloader(video, this.options);

        await videoDownloader.download();

        await videoDownloader.transcode();
    }

    private async downloadChat(video: Video) {
        const chatDownloader = new ChatDownloader(video);

        await chatDownloader.download();
    }

    async start(): Promise<void> {
        const videos = await this.fetchVideos();

        await this.downloadVideos(videos);
    }
}
