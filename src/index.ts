import prompts                  from 'prompts';
import {ensureConfigsAreLoaded} from './ui/environment';
import {VideosDownloaderUi}     from './ui/videos-downloader-ui';
import {ClipsDownloaderUi}      from './ui/clips-downloader-ui';
import {downloadYoutubeDl}      from './lib/youtubedl-downloader';
import {channelPrompt}          from './ui/prompts/channel-prompt';
import {instance, loadInstance} from './lib/twitch';
import {bootLogger}             from './lib/logger';

async function fetchUserId(name: string) {
    const user = await instance().api().users({login: name});

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();
    bootLogger();

    await downloadYoutubeDl();
    await loadInstance(process.env.CLIENT_ID ?? '');

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
