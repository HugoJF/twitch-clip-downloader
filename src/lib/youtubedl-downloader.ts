import os                                    from 'os';
import fs                                    from 'fs';
import path                                  from 'path';
import {YOUTUBEDL_PERMISSION, YOUTUBEDL_URL} from './configs';
import {ensureDirectoryExists, exists}       from './filesystem';
import {Downloader}                          from './downloader';
import {logger}                              from './logger';
import {sleep}                               from './utils';

export class YoutubedlDownloader {
    async download(): Promise<void> {
        const output = this.path();
        const url = this.url();

        ensureDirectoryExists(path.resolve(process.env.BIN_PATH ?? 'bin'));

        if (await exists(output)) {
            return;
        }

        const downloader = new Downloader(url, output);

        logger.verbose(`youtubedl: Download latest version ${url} to ${output}`);
        await downloader.download();

        // TODO: move this to downloader
        fs.chmodSync(output, YOUTUBEDL_PERMISSION);

        // Delay return to avoid EBUSY errors
        await sleep(1000);
    }

    url(): string {
        return YOUTUBEDL_URL.replace('{filename}', this.filename());
    }

    path(): string {
        return path.resolve(process.env.BIN_PATH ?? 'bin', this.filename());
    }

    filename(): string {
        if (os.platform() === 'win32') {
            return 'youtube-dl.exe';
        } else {
            return 'youtube-dl';
        }
    }
}
