// @ts-ignore
import Wrap            from 'youtube-dl-wrap';
import {youtubeDlPath} from './youtubedl-downloader';

const youtubedl = () => new Wrap(youtubeDlPath());

export default youtubedl;
