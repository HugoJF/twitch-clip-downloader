import path    from "path";
import {write} from "./filesystem";
import {debug} from "./utils";
import {Clip}  from "./twitch";

const metaPath = (channel: string) => path.resolve(path.join(__dirname, '..', `${channel}.meta`));

export const writeMetaFile = async (channel: string, clips: Clip[]) => {
    debug('Writing meta data to disk');
    return write(metaPath(channel), JSON.stringify(clips));
};

