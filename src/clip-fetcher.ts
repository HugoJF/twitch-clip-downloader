import pool                                                           from "tiny-async-pool";
import * as fns                                                       from "date-fns";
import {format}                                                                     from "date-fns";
import {debug, generateBatches, iterable, pathableDate, Period, sleep, splitPeriod} from "./utils";
import {api}                                                                        from "./api";
import {Clip, TwitchClipsApiResponse}                                 from "./twitch";
import {API_INSTANCES, BATCH_CLIP_THRESHOLD}                          from "./configs";
import {checkCache, getCache, saveCache}                              from "./cache";

interface Dict<T> {
    [key: string]: T;
}

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
        let clips;
        const index = id++;
        // Build the cache file path
        const leftDate = pathableDate(period.left);
        const rightDate = pathableDate(period.right);
        const cacheKey = `${leftDate}+${rightDate}`;
        const cacheDir = `${userId}-clips`;
        const cacheExists = await checkCache(cacheDir, cacheKey);

        if (cacheExists) {
            debug(`Found cache for key ${cacheKey}`);
            const buffer = await getCache(cacheDir, cacheKey);
            clips = JSON.parse(buffer);
        } else {
            debug(`Could not find cache for key ${cacheKey}`);
            clips = await fetchClipsFromBatch(userId, (clipCount) => onBatchUpdate(index, clipCount), period);
            saveCache(cacheDir, cacheKey, JSON.stringify(clips));
        }

        if (onBatchFinish) {
            onBatchFinish(index, Object.values(clips).length);
        }

        return clips;
    }

    const clipBatches = await pool(API_INSTANCES, batches, process);

    return clipBatches.reduce((all, batch) => ({...all, ...batch}), {});
}

async function fetchClipsFromBatch(
    userId: string,
    onUpdate: (clipCount: number) => void,
    period: Period
): Promise<Dict<Clip>> {
    const {left, right} = period;
    let clips: Dict<Clip> = {};
    let cursor;

    do {
        // This somehow fixes type-hinting in PhpStorm
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
    } while (cursor);

    debug('Period', left, 'to', right, 'resulted in', Object.keys(clips).length, 'clips');

    const clipCount = Object.keys(clips).length;

    if (clipCount > BATCH_CLIP_THRESHOLD) {
        debug(`Found ${clipCount} in one period, which is above the ${BATCH_CLIP_THRESHOLD} limit, splitting period...`);
        const newPeriods = splitPeriod(period);

        const newClipsDicts: Dict<Clip>[] = [];

        for (let newPeriod of newPeriods) {
            debug(`Fetching clips from ${newPeriod.left} to ${newPeriod.right}`);
            // FIXME: onUpdate call back does not accept a null here
            newClipsDicts.push(await fetchClipsFromBatch(userId, (a) => a, newPeriod));
        }

        const newClips = newClipsDicts.reduce((total, part) => ({...total, ...part}), {});

        debug(`After splitting period, found ${Object.keys(newClips).length} (from period ${clipCount})`);
        clips = {...clips, ...newClips};
    }

    return clips;
}

async function paginate(userId: string, period: Period, cursor: undefined | string): Promise<TwitchClipsApiResponse | false> {
    try {
        const {left, right} = period;

        const response = await api().clips({
            broadcaster_id: userId,
            first: 100,
            after: cursor,
            started_at: fns.formatRFC3339(left),
            ended_at: fns.formatRFC3339(right)
        });

        const {headers, status, data} = response;

        if (status !== 200) {
            console.error(`Error while fetching clips [code ${status}]: ${data.data}`);
            process.exit(1);
        }

        // debug(headers);
        // debug(data);

        return data;
    } catch (e) {
        console.error('Error while paginating the API', e);
        return false;
    }
}
