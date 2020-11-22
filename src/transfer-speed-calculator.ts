import {EventEmitter} from "events";

const seconds = () => Math.round(Date.now() / 1000);

export class TransferSpeedCalculator extends EventEmitter {
    private currentNow: number;
    private bytes: number;

    constructor() {
        super();

        this.currentNow = seconds();
        this.bytes = 0;

        this.reset();
    }

    data(bytes: number) {
        const now = seconds();

        this.emit('progress', bytes);

        if (this.currentNow !== now) {
            this.emit('speed', this.bytes);
            this.reset();
        }

        this.bytes += bytes;
    }

    reset() {
        this.bytes = 0;
        this.currentNow = seconds();
    }
}
