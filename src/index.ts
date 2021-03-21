import {ensureConfigsAreLoaded} from './environment';
import {channelPrompt}   from './prompts/channel-prompt';
import {api, loadApi}    from './api';
import {ClipsDownloader} from './clips-downloader';
import prompts                  from 'prompts';
import {VideosDownloader}       from './videos-downloader';
import {bootLogger}             from './logger';

async function fetchUserId(name: string) {
    const user = await api().users({login: name});

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();
    bootLogger();

    const channel = await channelPrompt();

    await loadApi();

    const id = await fetchUserId(channel);

    const downloadClips = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download clips from "${channel}"?`,
        initial: true
    });

    if (downloadClips.value) {
        const clipsDownloader = new ClipsDownloader(channel, id);

        await clipsDownloader.start();
    }

    const downloadVideos = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download videos (VODs, highlights, uploads) from "${channel}"?`,
        initial: true
    });

    if (downloadVideos.value) {
        const videosDownloader = new VideosDownloader(channel, id);

        await videosDownloader.start();
    }
}

start();
