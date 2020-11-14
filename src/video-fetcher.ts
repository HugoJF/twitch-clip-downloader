import {iterable, sleep}                from "./utils";
import {api}                            from "./api";
import {TwitchVideosApiResponse, Video} from "./twitch";

export async function fetchVideos(
    userId: string,
    onUpdate: (videoCount: number) => void,
): Promise<Dict<Video>> {
    let videos: Dict<Video> = {};
    let cursor;

    do {
        // This somehow fixes type-hinting in PhpStorm
        const responsePromise = paginate(userId, cursor);
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
            videos[video.id] = video;
        }

        onUpdate(Object.keys(videos).length);
    } while (cursor);

    return videos;
}

async function paginate(userId: string, cursor: undefined | string): Promise<TwitchVideosApiResponse | false> {
    try {
        const response = await api().videos({
            user_id: userId,
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
