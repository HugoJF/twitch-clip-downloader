import {appPath} from './utils';
import {logger}  from './logger';
import {write}   from './filesystem';

export const writeMetaFile = async (channel: string, data: any): Promise<void> => {
    logger.info('Writing meta data to disk');
    return write(appPath(`${channel}.meta`), JSON.stringify(data));
};
