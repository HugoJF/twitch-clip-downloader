import {Clip}                   from './twitch';
import {getClipUrl}             from './clip-url-fetcher';
import {ensureConfigsAreLoaded} from '../ui/environment';

test('existing clip successfully returns good url', async () => {
    await ensureConfigsAreLoaded();
    const clip = {
        title: 'a random clip',
        url: 'https://www.twitch.tv/de_nerdtv/clip/BashfulPhilanthropicPancakeTBCheesePull-VVHur9rg8ERqCgLp',
    };

    const url = await getClipUrl(clip as Clip);

    expect(url).toBe('https://production.assets.clips.twitchcdn.net/AT-cm%7C1085968337.mp4');
});

test('missing clip returns empty object', async () => {
    await ensureConfigsAreLoaded();
    const clip = {
        title: 'not a clip',
        url: 'https://www.twitch.tv/de_nerdtv/clip/thisisnotavalidurl',
    };
    const url = await getClipUrl(clip as Clip);

    expect(url).toBe(null);
});
