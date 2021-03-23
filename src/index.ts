import prompts                  from 'prompts';
import {ensureConfigsAreLoaded} from './ui/environment';
import {downloadYoutubeDl}      from './lib/youtubedl-downloader';
import {VideosDownloader}       from './lib/videos-downloader';
import {ClipsDownloader}        from './lib/clips-downloader';
import {channelPrompt}          from './ui/prompts/channel-prompt';
import {api, loadApi}           from './lib/api';
import {bootLogger}             from './lib/logger';

async function fetchUserId(name: string) {
    const user = await api().users({login: name});

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();
    bootLogger();

    await downloadYoutubeDl();
    await loadApi();

    const channel = await channelPrompt();
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
