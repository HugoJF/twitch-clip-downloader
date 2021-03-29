import {downloadYoutubeDl} from './youtubedl-downloader';
import {loadEnvironment}   from '../ui/environment';
import {getClipUrl}        from './clip-url-fetcher';

test('existing clip successfully returns good url', async () => {
    loadEnvironment();
    await downloadYoutubeDl();

    const clip = {
        title: 'a random clip',
        url: 'https://www.twitch.tv/de_nerdtv/clip/BashfulPhilanthropicPancakeTBCheesePull-VVHur9rg8ERqCgLp',
    };

    const url = await getClipUrl(clip as Clip);

    expect(url).toBe('https://production.assets.clips.twitchcdn.net/AT-cm%7C1085968337.mp4');
}, 30000);

test('missing clip returns empty object', async () => {
    loadEnvironment();
    await downloadYoutubeDl();

    const clip = {
        title: 'not a clip',
        url: 'https://www.twitch.tv/de_nerdtv/clip/thisisnotavalidurl',
    };
    const url = await getClipUrl(clip as Clip);

    expect(url).toBe(null);
}, 30000);
