// @ts-ignore
import Wrap from 'youtube-dl-wrap';

const youtubedl = new Wrap(process.env.YOUTUBE_DL_PATH);

export default youtubedl;
