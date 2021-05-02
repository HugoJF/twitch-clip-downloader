// @ts-ignore
import Wrap                  from 'youtube-dl-wrap';
import {YoutubedlDownloader} from './youtubedl-downloader';

const youtubedl = () => new Wrap((new YoutubedlDownloader).path());

export default youtubedl;
