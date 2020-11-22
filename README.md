# Twitch Clips Downloader
NodeJS tool to download every clip (and it's metadata) from a Twitch channel

## If you're looking for VOD, uploads or highlights download, please +1 this issue: https://github.com/HugoJF/twitch-clip-downloader/issues/13

This tool can PROBABLY download ALL clips from a channel (not only the top 1000).

This is not fully tested but seems to work as expected (tested with summit1g at around 163k clips).

## Dependencies
  - NodeJS
  - NPM
  - Twitch App Client-ID and Client Secret
  
## How to use

##### Create an app on Twitch Console

Register an application on [Twitch Console](https://dev.twitch.tv/console/apps), click **Manage** and copy the **Client ID** and generate a **Client Secret**.


##### Install NodeJS dependencies

Install `cross-env`:
```bash
npm install -g cross-env
```

Run the following command in your console:
```bash
npm install
```

##### Build the project

Run the following command in your console:
```bash
npm run dev
```

##### Run via NPM

Run the script via NPM with (this is needed to get `dotenv` loaded):
```bash
npm run start
```

The first time you run this tool, our wizard will ask for your **Client ID** and **Client Secret** (both created in the first step) directly in your console.

It will also ask if you want to run in debug mode, which can be turned off for normal usage. If you encounter any problems **please enable debug mode** creating an issue.  

##### Select channel

Each time you run this script, it will ask you for a channel name, and then confirm if you want to download everything.
