# Twitch Clips Downloader
NodeJS tool to download every clip (and it's metadata) from a Twitch channel

### `This tool can PROBABLY download ALL clips from a channel (not only the top 1000)`

This is not fully tested but seems to work as expected (tested with summit1g at around 163k clips).

## Dependencies
  - NodeJS
  - NPM
  - Twitch App Client-ID and Client Secret
  
## How to use

##### Create an app on Twitch Console

Register an application on [Twitch Console](https://dev.twitch.tv/console/apps), click **Manage** and copy the **Client ID** and generate a **Client Secret**.

##### Copy .env.example

Just copy (or rename it) the provided `.env.example` to `.env`


##### Fill .env information

You must fill the `CLIENT_ID` and `CLIENT_SECRET` with your newly created credentials from Twitch Console.

That's it. But if you want to tweak some stuff, here are the descriptions for each variable:

  - `DEBUG`: print some extra information, just keep it false for normal use;
  - `YOUTUBEDL_INSTANCES`: how many concurrent youtube-dl instances should be used to download clips. Don't go too high because youtube-dl is pretty CPU intensive, and if you are storing in a HDD, it's just not worth it to increase beyond 10 instances.

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
