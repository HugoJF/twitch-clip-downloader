import os                                    from 'os';
import fs                                    from 'fs';
import path                                  from 'path';
import {YOUTUBEDL_PERMISSION, YOUTUBEDL_URL} from './configs';
import {ensureDirectoryExists, exists}       from './filesystem';
import {Downloader}                          from './downloader';
import {logger}                              from './logger';
import {sleep}                               from './utils';

export function youtubeDlFilename(): string {
    if (os.platform() === 'win32') {
        return 'youtube-dl.exe';
    } else {
        return 'youtube-dl';
    }
}

export function youtubeDlPath(): string {
    return path.resolve(process.env.BIN_PATH ?? 'bin', youtubeDlFilename());
}

export function youtubeDlUrl(): string {
    return YOUTUBEDL_URL.replace('{filename}', youtubeDlFilename());
}

export async function downloadYoutubeDl(): Promise<void> {
    const output = youtubeDlPath();
    const url = youtubeDlUrl();

    ensureDirectoryExists(path.resolve(process.env.BIN_PATH ?? 'bin'));

    if (await exists(output)) {
        return;
    }

    const downloader = new Downloader(url, output);

    logger.verbose(`youtubedl: Download latest version ${url} to ${output}`);
    await downloader.download();

    fs.chmodSync(output, YOUTUBEDL_PERMISSION);

    // Delay return to avoid EBUSY errors
    await sleep(1000);
}
