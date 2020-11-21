import {debug} from "./utils";

const Wrap = require('youtube-dl-wrap');
const axios = require('axios');

const youtubedl = new Wrap('./bin/youtube-dl.exe');

// FIXME: properly parse the .m3u8?
const firstManifestStreamPattern = /#EXT-X-STREAM.*?\n(http.*?\.m3u8)/;
const manifestFragmentPattern = /#EXTINF.*?\n(.*?\.ts)/g;

export async function fragments(url: string): Promise<{[name: string]: string}> {
    // Use YoutubeDL to fetch manifest URL
    const meta = await youtubedl.getVideoInfo(url);
    debug(meta.manifest_url);

    // Download video manifest
    const videoManifestRequest = await axios.get(meta.manifest_url);
    const videoManifest = videoManifestRequest.data;
    debug(videoManifest);

    // Grab the first stream listed in the manifest and hope it's the original quality
    const manifestUrlMatch = videoManifest.match(firstManifestStreamPattern);
    const manifestUrl = manifestUrlMatch[1];
    const manifestUrlParts = manifestUrl.split('/');
    const manifestBaseUrl = manifestUrlParts.slice(0, manifestUrlParts.length - 1).join('/');
    debug(manifestUrl);

    // Download the specific stream manifest
    const streamManifestRequest = await axios.get(manifestUrl);
    const streamManifest = streamManifestRequest.data;

    // Match fragments listed in the manifest
    const matchedFragments = streamManifest.matchAll(manifestFragmentPattern);

    // Extract from match
    // FIXME: any
    const fragments = Array.from(matchedFragments).map((matches: any) => matches[1]);

    // Join the base manifestUrl with fragment name
    return fragments.reduce((result, frag) => {
        result[frag] = [manifestBaseUrl, frag].join('/');

        return result;
    }, {});
}
