import fns from "date-fns";

export type Period = {
    from: Date,
    to: Date,
}

export function debug (...messages: any[]) {
    if (process.env.DEBUG === 'true') {
        console.log(...messages);
    }
}

export function generateBatches (): Period[] {
    let base = fns.endOfToday();

    // The day Twitch Clips were announced
    const end = new Date(2016, 5, 26);
    const batches: Period[] = [];

    while (fns.compareAsc(base, end) >= 0) {
        const next = fns.subDays(base, 7);
        batches.push({ from: next, to: base });
        base = next;
    }

    return batches;
}

export function sleep (delay: number) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

// https://stackoverflow.com/questions/18884249/checking-whether-something-is-iterable
export function iterable (obj: any) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.iterator] === 'function';
}
