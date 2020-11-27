# Twitch Clips Downloader
NodeJS tool to download every clip (and it's metadata) from a Twitch channel

## If you're looking for VOD, uploads or highlights download, please +1 this issue: https://github.com/HugoJF/twitch-clip-downloader/issues/13

This tool can PROBABLY download ALL clips from a channel (not only the top 1000).

This is not fully tested but seems to work as expected (tested with summit1g at around 163k clips).

## Dependencies
  - [NodeJS](https://nodejs.org/en/download/) - used to run this tool;
  - [Python](https://www.python.org/downloads/) - used to run `youtube-dl`;
  - [ffmpeg](https://ffmpeg.org/download.html) - used to transcode VODs from `.ts` to `.mp4`;
  - NPM or Yarn - to install dependencies;
  - Twitch App Client-ID and Client Secret (explained below) - to access Twitch's API.
  
## How to use

##### Create an app on Twitch Console

Register an application on [Twitch Console](https://dev.twitch.tv/console/apps), click **Manage** and copy the **Client ID** and generate a **Client Secret**.

##### Copy .env.example

Just copy (or rename it) the provided `.env.example` to `.env`


##### Fill .env information

You must fill the `CLIENT_ID` and `CLIENT_SECRET` with your newly created credentials from Twitch Console.

That's it. But if you want to tweak some stuff, here are the descriptions for each variable:

  - `DEBUG`: print some extra information, just keep it false for normal use;
  - `CLIENT_ID`: Twitch API Client ID;
  - `CLIENT_SECRET`: Twitch API Client Secret;
  - `BASEPATH`: where files (clips, VODs, fragments) should be stored;
  - `YOUTUBE_DL_PATH`: where youtube-dl executable is located;
  - `VIDEOS_PARALLEL_DOWNLOADS`: how many VOD fragments should be downloaded at the same time.
  - `CLIPS_PARALLEL_DOWNLOADS`: how many clips should be downloaded at the same time.

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

Each time you run this script, it will ask you for a channel name, and then confirm if you want to download everything.
