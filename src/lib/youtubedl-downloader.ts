import os                      from 'os';
import path                    from 'path';
import {Downloader}            from './downloader';
import {logger}                        from './logger';
import {ensureDirectoryExists, exists} from './filesystem';

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
    return 'https://github.com/ytdl-org/youtube-dl/releases/latest/download/' + youtubeDlFilename();
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
}
