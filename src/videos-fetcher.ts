import {iterable, sleep}                from "./utils";
import {api}                            from "./api";
import {TwitchVideosApiResponse, Video} from "./twitch";
import {EventEmitter}                   from "events";

export class VideosFetcher extends EventEmitter {
    private readonly userId: string;
    private videos: Dict<Video> = {};

    constructor(userId: string) {
        super();
        this.userId = userId;
    }

    private async paginate(cursor: undefined | string): Promise<TwitchVideosApiResponse | false> {
        try {
            const response = await api().videos({
                user_id: this.userId,
                first: 100,
                after: cursor,
            });

            const {headers, status, data} = response;

            if (status !== 200) {
                console.error(`Error while fetching videos [code ${status}]: ${data.data}`);
                process.exit(1);
            }

            return data;
        } catch (e) {
            console.error('Error while paginating the API', e);
            return false;
        }
    }

    async fetchVideos(): Promise<Dict<Video>> {
        let cursor;

        do {
            // This somehow fixes type-hinting in PhpStorm
            const responsePromise = this.paginate(cursor);
            const response = await responsePromise;

            if (response === false) {
                console.error('Error while paginating, waiting a few seconds before continuing...');
                await sleep(10000);
                continue;
            }

            if (!iterable(response.data)) {
                console.error('API returned 200 but data is not iterable, waiting before trying again...');
                await sleep(10000);
                continue;
            }

            if (response.pagination) {
                cursor = response.pagination.cursor;
            }

            for (const video of response.data) {
                this.videos[video.id] = video;

                this.emit('video', {video, videos: this.videos});
            }
        } while (cursor);

        return this.videos;
    }

}
