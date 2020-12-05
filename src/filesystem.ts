import {promisify} from 'util';
import fs          from 'fs';
import {logger}    from './logger';
import {appPath}   from './utils';

export const access = promisify(fs.access);
export const write = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export const existsSync = (filePath: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);

        return true;
    } catch (e) {
        return false;
    }
};

export function ensureDirectoryExists (directory: string) {
    if (!existsSync(directory)) {
        logger.info(`Could not find "${directory}", creating it...`);
        fs.mkdirSync(directory, {recursive: true});
    } else {
        logger.verbose(`"${directory}" directory found!`);
    }
}

export function ensureAppDirectoryExists(directory: string) {
    ensureDirectoryExists(appPath(directory));
}

export const exists = async (filePath: string) => {
    try {
        // throws if it doesn't exist
        await access(filePath, fs.constants.F_OK);

        return true;
    } catch (error) {
        return false;
    }
};
