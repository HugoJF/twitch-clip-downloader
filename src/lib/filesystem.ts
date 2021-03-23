import fs          from 'fs';
import {promisify} from 'util';
import {appPath}   from './utils';
import {logger}    from './logger';

export const access = promisify(fs.access);
export const write = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export function existsSync (filePath: string): boolean {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);

        return true;
    } catch (e) {
        return false;
    }
}

export function ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
        logger.info(`Could not find "${directory}", creating it...`);
        fs.mkdirSync(directory, {recursive: true});
    } else {
        logger.verbose(`"${directory}" directory found!`);
    }
}

export function ensureAppDirectoryExists(directory: string): void {
    ensureDirectoryExists(appPath(directory));
}

export async function exists (filePath: string): Promise<boolean> {
    try {
        // throws if it doesn't exist
        await access(filePath, fs.constants.F_OK);

        return true;
    } catch (error) {
        return false;
    }
}
