import pool                                                                  from "tiny-async-pool";
import * as fns                                                              from "date-fns";
import {generateBatches, iterable, pathableDate, Period, sleep, splitPeriod} from "./utils";
import {api}                                                                 from "./api";
import {Clip, TwitchClipsApiResponse}                                        from "./twitch";
import {API_INSTANCES, BATCH_CLIP_THRESHOLD}                                 from "./configs";
import {checkCache, getCache, saveCache}                                     from "./cache";
import {logger}                                                              from "./logger";
import {EventEmitter}                                                        from "events";

export class ClipFetcher extends EventEmitter {
    private readonly userId: string;

    private clips: Dict<Clip>;

    constructor(userId: string) {
        super();

        this.userId = userId;
        this.clips = {};
    }

    private async paginate(period: Period, cursor: undefined | string): Promise<TwitchClipsApiResponse | false> {
        try {
            const {left, right} = period;

            const response = await api().clips({
                broadcaster_id: this.userId,
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

    private async fetchClipsFromBatch (period: Period) {
        const {left, right} = period;
        let cursor;

        logger.verbose(`Fetching clips from period ${period.left} ~ ${period.right}`);

        do {
            // This somehow fixes type-hinting in PhpStorm
            const responsePromise = this.paginate(period, cursor);
            const response = await responsePromise;

            logger.verbose({cursor, response});

            if (response === false) {
                logger.error('Error while paginating, waiting a few seconds before continuing...');
                await sleep(10000);
                continue;
            }

            if (!iterable(response.data)) {
                logger.error('API returned 200 but data is not iterable, waiting before trying again...');
                await sleep(10000);
                continue;
            }

            for (const clip of response.data) {
                this.clips[clip.id] = clip;
            }

            this.emitClipCount();

            if (response.pagination) {
                cursor = response.pagination.cursor;
            }
        } while (cursor);

        const clipCount = Object.keys(this.clips).length;

        logger.verbose('Period', left, 'to', right, 'resulted in', clipCount, 'clips');

        if (clipCount > BATCH_CLIP_THRESHOLD) {
            logger.info(`Found ${clipCount} in one period, which is above the ${BATCH_CLIP_THRESHOLD} limit, splitting period...`);
            const newPeriods = splitPeriod(period);

            const newClipsDicts: Dict<Clip>[] = [];

            for (let newPeriod of newPeriods) {
                logger.verbose(`Fetching clips from ${newPeriod.left} to ${newPeriod.right}`);
                // FIXME: onUpdate call back does not accept a null here
                newClipsDicts.push(await this.fetchClipsFromBatch(newPeriod));
            }

            const newClips = newClipsDicts.reduce((total, part) => ({...total, ...part}), {});

            logger.info(`After splitting period, found ${Object.keys(newClips).length} (from period ${clipCount})`);
            this.clips = {...this.clips, ...newClips};
            this.emitClipCount();
        }

        return this.clips;
    }

    async start() {
        const batches = generateBatches();
        let id = 0;

        this.emit('batch-generated', batches.length);

        const process = async (period: Period) => {
            let clips;
            const index = id++;
            // Build the cache file path
            const leftDate = pathableDate(period.left);
            const rightDate = pathableDate(period.right);
            const cacheKey = `${leftDate}+${rightDate}`;
            const cacheDir = `${this.userId}-clips`;
            const cacheExists = await checkCache(cacheDir, cacheKey);

            if (cacheExists) {
                logger.verbose(`Found cache for key ${cacheKey}`);
                const buffer = await getCache(cacheDir, cacheKey);
                clips = JSON.parse(buffer);
            } else {
                logger.verbose(`Could not find cache for key ${cacheKey}`);
                clips = await this.fetchClipsFromBatch(period);
                saveCache(cacheDir, cacheKey, JSON.stringify(clips));
            }

            this.clips = {...this.clips, ...clips};
            this.emitClipCount();

            this.emit('batch-finished');

            return clips;
        };

        const clipBatches = await pool(API_INSTANCES, batches, process);

        return clipBatches.reduce((all, batch) => ({...all, ...batch}), {});
    }

    private emitClipCount() {
        this.emit('clip-count', Object.values(this.clips).length);
    }
}
