import pool                                              from "tiny-async-pool";
import * as fns                                          from "date-fns";
import {debug, generateBatches, iterable, Period, sleep} from "./utils";
import {api}                                             from "./api";
import {Clip, TwitchClipsApiResponse}                    from "./twitch";


// 10 should be enough to keep rate-limit under control
const API_INSTANCES = 10;

export async function fetchClips(
    userId: string,
    onBatchGenerated: (batchLength: number) => void,
    onBatchFinish: (batchLength: number, clipCount: number) => void,
    onCountUpdate: (count: number) => void
) {
    const batches = generateBatches();
    const counts: { [id: number]: number } = {};
    let id = 0;

    if (onBatchGenerated) {
        onBatchGenerated(batches.length);
    }

    function onBatchUpdate(id: number, count: number) {
        counts[id] = count;

        const total = Object.values(counts).reduce((acc, cur) => acc + cur, 0);

        if (onCountUpdate) {
            onCountUpdate(total);
        }
    }

    async function process(period: Period) {
        const index = id++;
        const clips = await fetchClipsFromBatch(userId, (clipCount) => onBatchUpdate(index, clipCount), period);

        if (onBatchFinish) {
            onBatchFinish(index, Object.values(clips).length);
        }

        return clips;
    }

    const clipBatches = await pool(API_INSTANCES, batches, process);

    return clipBatches.reduce((all, batch) => ({...all, ...batch}), {});
}

async function fetchClipsFromBatch(userId: string, onUpdate: (clipCount: number) => void, period: Period) {
    const clips: { [id: string]: Clip } = {};
    const {from, to} = period;
    let cursor;

    do {
        const responsePromise = paginate(userId, period, cursor);
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

        for (const clip of response.data) {
            clips[clip.id] = clip;
        }

        onUpdate(Object.keys(clips).length);

        debug('Period', from, 'to', to, 'resulted in', Object.keys(clips).length, 'clips');
    } while (cursor);

    return clips;
}

async function paginate(userId: string, period: Period, cursor: undefined | string): Promise<TwitchClipsApiResponse | false> {
    try {
        const {from, to} = period;

        debug('Broadcaster ID', userId);
        debug('From', from);
        debug('To', to);

        const response = await api().clips({
            broadcaster_id: userId,
            first: 100,
            after: cursor,
            started_at: fns.formatRFC3339(from),
            ended_at: fns.formatRFC3339(to)
        });

        const {headers, status, data} = response;

        if (status !== 200) {
            console.error(`Error while fetching clips [code ${status}]: ${data.data}`);
            process.exit(1);
        }

        debug(headers);
        debug(data);

        return data;
    } catch (e) {
        console.error('Error while paginating the API', e);
        return false;
    }
}
