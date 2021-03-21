// @ts-ignore
import Wrap            from 'youtube-dl-wrap';
import {youtubeDlPath} from './youtubedl-downloader';

// FIXME: .env is not loaded here
const youtubedl = new Wrap(youtubeDlPath());

export default youtubedl;
