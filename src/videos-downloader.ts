import ora                   from "ora";
import prompts               from "prompts";
import {startVideosDownload} from "./media-downloader";
import cliProgress           from "cli-progress";
import {fetchVideos}         from "./video-fetcher";
import {Video}               from "./twitch";
import {logger}              from "./logger";

export class VideosDownloader {
    channel: string;
    userId: string;

    videos?: Dict<Video>;

    apiSpinner: ora.Ora;
    downloadBar: cliProgress.SingleBar;

    constructor(channel: string, userId: string) {
        this.channel = channel;
        this.userId = userId;

        this.apiSpinner = ora('Paginating API, please wait...');
        this.downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }

    private async fetchVideos() {
        // API fetching phase
        let totalBatches = 0;
        let finishedBatches = 0;

        this.apiSpinner.start();

        const onCountUpdate = (total: number) => {
            this.apiSpinner.text = `Paginating API, found ${total} clips, ${finishedBatches}/${totalBatches} please wait...`;
        };

        this.videos = await fetchVideos(this.userId, onCountUpdate);

        this.apiSpinner.succeed('Finished API pagination.');
        this.apiSpinner.clear();

        // Metadata phase
        // TODO: migrate to videos
        // writeMetaFile(channel, Object.values(videos));
    }

    private async downloadVideos() {
        if (!this.videos) {
            logger.error('There are no videos loaded to download');
            throw new Error('No videos loaded');
        }

        // Confirmation phase
        const videoCount = Object.values(this.videos).length;
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

        // Download phase
        this.downloadBar.start(videoCount, 0);

        const finished = await startVideosDownload(
            Object.values(this.videos)
        );

        this.downloadBar.stop();

        console.log(`Finished download of ${finished} out of ${videoCount}!`);
    }

    async start() {
        await this.fetchVideos();
        await this.downloadVideos();
    }
}
