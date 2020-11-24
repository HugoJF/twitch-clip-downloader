import axios                     from 'axios';
import fs                        from 'fs';
import {logger}                  from "./logger";
import {EventEmitter}            from "events";
import {TransferSpeedCalculator} from "./transfer-speed-calculator";
import {appPath}                 from "./utils";

export class Downloader extends EventEmitter {
    private readonly url: string;
    private readonly path: string;

    private tries: number;
    private maxTries: number;

    private speed: TransferSpeedCalculator;

    constructor(url: string, path: string) {
        super();

        this.url = url;
        this.path = appPath(path);

        this.tries = 0;
        this.maxTries = 0;

        this.speed = new TransferSpeedCalculator;

        // Bubble 'progress' event up
        this.speed.on('progress', this.emit.bind(this, 'progress'));
    }

    async download() {
        return new Promise(async (res, rej) => {
            do {
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
                    rej(e);
                }
            } while (++this.tries < this.maxTries)
        })
    }
}
