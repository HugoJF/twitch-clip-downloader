import path from 'path';
// @ts-ignore
import Wrap from 'youtube-dl-wrap';

// FIXME: .env is not loaded here
const youtubedl = new Wrap(path.resolve(__dirname, process.env.YOUTUBE_DL_PATH ?? '../../bin/youtube-dl.exe'));

export default youtubedl;
