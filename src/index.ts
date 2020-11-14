import {channelPrompt}          from './prompts/channel-prompt';
import {ensureConfigsAreLoaded} from "./environment";
import {api, load}              from "./api";
import cliProgress              from "cli-progress";
import ora                      from "ora";
import {clips}                  from "./clips-downloader";
import prompts                  from "prompts";
import {videos}                 from "./videos-downloader";

let apiSpinner: ora.Ora | null;
const downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function fetchUserId(name: string) {
    const user = await api().users({login: name});

    return user.data.data[0].id;
}

async function start() {
    await ensureConfigsAreLoaded();

    const channel = await channelPrompt();

    // FIXME: LOAD WAT
    await load();

    const id = await fetchUserId(channel);

    const downloadClips = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download clips from "${channel}"?`,
        initial: true
    });

    if (downloadClips.value) {
        await clips(channel, id);
    }

    const downloadVideos = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to download videos (VODs, highlights, uploads) from "${channel}"?`,
        initial: true
    });

    if (downloadVideos.value) {
        await videos(channel, id);
    }
}

start();
