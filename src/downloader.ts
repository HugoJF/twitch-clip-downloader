import axios                     from 'axios';
import fs                        from 'fs';
import {logger}                  from "./logger";
import {EventEmitter}            from "events";
import {TransferSpeedCalculator} from "./transfer-speed-calculator";

export class Downloader extends EventEmitter {
    private readonly url: string;
    private readonly path: string;

    private speed: TransferSpeedCalculator;

    constructor(url: string, path: string) {
        super();

        this.url = url;
        this.path = path;

        this.speed = new TransferSpeedCalculator;

        // Bubble 'progress' event up
        this.speed.on('progress', this.emit.bind(this, 'progress'));
    }

    async download() {
        return new Promise(async (res, rej) => {
            try {
                const {data} = await axios({
                    url: this.url,
                    method: 'GET',
                    responseType: 'stream'
                });

                // TODO: type this
                data.on('data', (chunk: any) => {
                    this.speed.data(chunk.length);
                });

                data.on('close', () => {
                    logger.verbose(`Download ${this.url} finished on ${this.path}`);
                    fs.renameSync(`${this.path}.progress`, `${this.path}`);
                    res(this.path);
                });

                data.pipe(fs.createWriteStream(`${this.path}.progress`));
            } catch (e) {
                if (this.shouldReject()) {
                    rej(e);
                }
            }
        })
    }

    private shouldReject() {
        this.tries++;

        if (this.tries >= this.maxTries) {

        }
    }
}
