import fs                                        from 'fs';
import {exists, existsSync, readFile, writeFile} from './filesystem';

function getCachePath(path: string, key: string): string {
    return `cache/${path}/${key}.cache`;
}

export async function checkCache(path: string, key: string): Promise<boolean> {
    return await exists(getCachePath(path, key));
}

export async function getCache(path: string, key: string): Promise<string> {
    ensureCacheDirectoryExists(path);

    const cachePath = getCachePath(path, key);
    const buffer = await readFile(cachePath);

    return buffer.toString();
}

export async function saveCache(path: string, key: string, content: string): Promise<void> {
    ensureCacheDirectoryExists(path);
    writeFile(getCachePath(path, key), content);
}

function ensureCacheDirectoryExists(path: string): void {
    if (!existsSync('cache')) {
        fs.mkdirSync('cache');
    }
    if (!existsSync(`cache/${path}`)) {
        fs.mkdirSync(`cache/${path}`);
    }
}
