import path from "path";
import {writeFile} from "./filesystem";
import {debug} from "./utils";

const metaPath = (channel: string) => path.resolve(path.join(__dirname, '..', `${channel}.meta`));

export const writeMetaFile = async (channel: string, clips) => {
    debug('Writing meta data to disk');
    return writeFile(metaPath(channel), JSON.stringify(clips));
};

