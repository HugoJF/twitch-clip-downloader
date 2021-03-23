import {appPath} from './utils';
import {logger}  from './logger';
import {write}   from './filesystem';

const metaPath = (channel: string) => appPath(`${channel}.meta`);

export const writeMetaFile = async (channel: string, data: any): Promise<void> => {
    logger.info('Writing meta data to disk');
    return write(metaPath(channel), JSON.stringify(data));
};

