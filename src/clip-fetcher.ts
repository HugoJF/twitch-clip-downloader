import pool from "tiny-async-pool";
import fns from "date-fns";
import {debug, generateBatches, iterable, Period, sleep} from "./utils";
import {api} from "./api";


// 10 should be enough to keep rate-limit under control
const API_INSTANCES = 10;

export async function fetchClips (userId: string, onBatchGenerated, onBatchFinish, onCountUpdate: (count: number) => void) {
    const batches = generateBatches();
    const counts: {[id: number]: number} = {};
    let id = 0;

    if (onBatchGenerated) {
        onBatchGenerated(batches.length);
    }

    function onBatchUpdate (id: number, count: number) {
        counts[id] = count;

        const total = Object.values(counts).reduce((acc, cur) => acc + cur, 0);

        if (onCountUpdate) {
            onCountUpdate(total);
        }
    }

    async function process (period: Period) {
        const index = id++;
        const clips = await fetchClipsFromBatch(userId, onBatchUpdate.bind(this, index), period);

        if (onBatchFinish) {
            onBatchFinish(index, Object.values(clips).length);
        }

        return clips;
    }

    const clipBatches = await pool(API_INSTANCES, batches, process);

    return clipBatches.reduce((all, batch) => ({ ...all, ...batch }), {});
}

async function fetchClipsFromBatch (userId: string, onUpdate, period: Period) {
    const clips: {[id: number]: object} = {};
    let cursor;
    const { from, to } = period;

    do {
        const response = await paginate(userId, period, cursor);

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

async function paginate (userId: string, period: Period, cursor: undefined|string) {
    try {
        const { from, to } = period;

        debug('Broadcaster ID', userId);
        debug('From', from);
        debug('To', to);

        const response = await api().clips({
            broadcaster_id: userId,
            first:          100,
            after:          cursor,
            started_at:     fns.formatRFC3339(from),
            ended_at:       fns.formatRFC3339(to)
        });

        const { headers, status, data, error, message } = response;

        if (error) {
            console.error(`Error while fetching clips [code ${status}]: ${error}`);
            console.error(message);
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
