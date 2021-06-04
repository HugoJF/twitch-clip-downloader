import prompts                                                   from 'prompts';
import {bootLogger, instance, loadInstance, YoutubedlDownloader} from 'twitch-tools';
import {bootLogger as bootLocalLogger}                           from './logger';
import {ensureConfigsAreLoaded}                                  from './environment';
import {VideosDownloaderUi}                                      from './videos-downloader-ui';
import {ClipsDownloaderUi}                                       from './clips-downloader-ui';
import {channelPrompt}                                           from './prompts/channel-prompt';

async function fetchUserId(name: string) {
    const user = await instance().api().users({login: name});

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();

    bootLogger(process.env.DEBUG === 'true');
    bootLocalLogger(process.env.DEBUG === 'DEBUG');

    await loadInstance(process.env.CLIENT_ID ?? '', process.env.CLIENT_SECRET ?? '');
    await (new YoutubedlDownloader).download();

    const channel = await channelPrompt();
    const id = await fetchUserId(channel);

    const downloadClips = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download clips from "${channel}"?`,
        initial: true
    });

    if (downloadClips.value) {
        const clipsDownloader = new ClipsDownloaderUi(channel, id);

        await clipsDownloader.start();
    }

    const downloadVideos = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download videos (VODs, highlights, uploads) from "${channel}"?`,
        initial: true
    });

    if (downloadVideos.value) {
        const videosDownloader = new VideosDownloaderUi(channel, id);

        await videosDownloader.start();
    }
}

start();
