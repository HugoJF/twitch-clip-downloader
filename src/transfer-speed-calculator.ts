import {EventEmitter} from "events";
import {logger}       from "./logger";

const nowSeconds = () => Math.round(Date.now() / 1000);

export class TransferSpeedCalculator extends EventEmitter {
    private currentNow: number;
    private bytes: number;

    constructor() {
        super();

        this.currentNow = nowSeconds();
        this.bytes = 0;
    }

    data(bytes: number) {
        this.emit('progress', bytes);

        if (this.currentNow !== nowSeconds()) {
            this.emit('speed', this.bytes);
            this.reset();
        }

        this.bytes += bytes;
    }

    reset() {
        this.bytes = 0;
        this.currentNow = nowSeconds();
    }
}
