# Twitch Clips (and VODs) Downloader

[![codecov](https://codecov.io/gh/HugoJF/twitch-clip-downloader/branch/master/graph/badge.svg?token=HL0PSDR9AA)](https://codecov.io/gh/HugoJF/twitch-clip-downloader)

[![workflow](https://img.shields.io/github/workflow/status/HugoJF/twitch-clip-downloader/Run%20tests)](https://github.com/HugoJF/twitch-clip-downloader/actions)

NodeJS tool to batch download clips and VODs (and it's metadata) from a Twitch channel.

This tool can PROBABLY download ALL clips from a channel (not only the top 1000). At this point in time this tool has been tested on multiple big channels and seems to be able to get all clips ([433k clips from `hasanabi`](https://github.com/HugoJF/twitch-clip-downloader/issues/32#issuecomment-809679661)). 

In order to maximize clip coverage, this tool will not allow Twitch API to report more then [500](https://github.com/HugoJF/twitch-clip-downloader/blob/master/src/lib/configs.ts#L5) clips in a single period. Pagination beyond this point is unreliable (caps around 1k clips but varies alot). To fix this, periods with more than 500 clips, will be split in [2](https://github.com/HugoJF/twitch-clip-downloader/blob/master/src/lib/utils.ts#L6), and the process will restart until a single period reports less than 500 clips.

## Dependencies
  - [NodeJS](https://nodejs.org/en/download/) - used to run this tool;
  - [Python](https://www.python.org/downloads/) - used to run `youtube-dl`;
  - [ffmpeg](https://ffmpeg.org/download.html) - used to transcode VODs from `.ts` to `.mp4`;
  - NPM or Yarn - to install dependencies;
  - Twitch App `Client-ID` and `Client Secret` (explained below) - to access Twitch's API.
  
## How to use

##### Create an app on Twitch Console

Register an application on [Twitch Console](https://dev.twitch.tv/console/apps), click **Manage** and copy the **Client ID** and generate a **Client Secret**.


##### Install NodeJS dependencies

Run this command on your console:
```bash
npm install
```

##### Run via NPM

Run the script via NPM with (this is needed to get `dotenv` loaded):
```bash
npm run start
```

##### Prompts

Every information needed will be prompted on startup via de terminal.

Each time you run this script, it will ask you for a channel name, and then confirm if you want to download everything.

## Environment Variables

Here are the descriptions for each variable:

  - `DEBUG`: print a fuck-metric-ton of information, just keep it false for normal use;
  - `CLIENT_ID`: Twitch API Client ID;
  - `CLIENT_SECRET`: Twitch API Client Secret;
  - `BASEPATH`: where files (clips, VODs, fragments) should be stored;
  - `YOUTUBE_DL_PATH`: where youtube-dl executable is located;
  - `VIDEOS_PARALLEL_DOWNLOADS`: how many VOD fragments should be downloaded at the same time.
  - `CLIPS_PARALLEL_DOWNLOADS`: how many clips should be downloaded at the same time;
  - `BIN_PATH`: path where binaries will be stored;
  - `DEFAULT_PERIOD_HOURS`: default period size in hours (12 is a good number for big channels. Lower this to avoid period splitting, increase this to reduce API counts and speedup URL fetching).
