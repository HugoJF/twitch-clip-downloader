const {sleep, debug, generateBatches} = require('./utils');
const {api} = require('./api');
const pool = require('tiny-async-pool');
const fns = require('date-fns');
const {iterable} = require("./utils");

// 10 should be enough to keep rate-limit under control
const API_INSTANCES = 10;

async function fetchClips(userId, onBatchGenerated, onBatchFinish, onCountUpdate) {
    const batches = generateBatches();
    const counts = {};
    let id = 0;

    if (onBatchGenerated) {
        onBatchGenerated(batches.length);
    }

    function onBatchUpdate(id, count) {
        counts[id] = count;

        let total = Object.values(counts).reduce((acc, cur) => acc + cur, 0);

        if (onCountUpdate) {
            onCountUpdate(total);
        }
    }

    async function process(period) {
        let index = id++;
        let clips = await fetchClipsFromBatch(userId, onBatchUpdate.bind(this, index), period);

        if (onBatchFinish) {
            onBatchFinish(index, Object.values(clips).length);
        }

        return clips;
    }

    let clipBatches = await pool(API_INSTANCES, batches, process);

    return clipBatches.reduce((all, batch) => ({...all, ...batch}), {});
}

async function fetchClipsFromBatch(userId, onUpdate, period) {
    let clips = {};
    let cursor = undefined;
    const {from, to} = period;

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

        for (let clip of response.data) {
            clips[clip.id] = clip;
        }

        onUpdate(Object.keys(clips).length);

        debug('Period', from, 'to', to, 'resulted in', Object.keys(clips).length, 'clips');
    } while (cursor);

    return clips;
}

async function paginate(userId, period, cursor) {
    try {
        let {from, to} = period;

        debug('Broadcaster ID', userId);
        debug('From', from);
        debug('To', to);

        let response = await api().clips({
            broadcaster_id: userId,
            first: 100,
            after: cursor,
            started_at: fns.formatRFC3339(from),
            ended_at: fns.formatRFC3339(to),
        });

        const {headers, status, data, error, message} = response;

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

module.exports = {fetchClips};