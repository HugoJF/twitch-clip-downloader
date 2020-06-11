const fns = require('date-fns');

function debug(...messages) {
    if (process.env.DEBUG === 'true') {
        console.log(...messages);
    }
}

function generateBatches() {
    let base = fns.endOfToday();
    // The day Twitch Clips were announced
    let end = new Date(2016, 5, 26);
    let periods = [];

    while (fns.compareAsc(base, end) >= 0) {
        let next = fns.subDays(base, 7);
        periods.push({from: next, to: base});
        base = next;
    }

    return periods;
}

function sleep(delay) {
    return new Promise((res, rej) => {
        setTimeout(res, delay);
    })
}

// https://stackoverflow.com/questions/18884249/checking-whether-something-is-iterable
function iterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.iterator] === 'function';
}

module.exports = {sleep, debug, generateBatches, iterable};