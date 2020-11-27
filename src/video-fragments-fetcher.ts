import {logger} from "./logger";
import axios     from "axios";
import youtubedl from "./youtubedl";

// FIXME: properly parse the .m3u8?
const firstManifestStreamPattern = /#EXT-X-STREAM.*?\n(http.*?\.m3u8)/;
const manifestFragmentPattern = /#EXTINF.*?\n(.*?\.ts)/g;

export async function fragments(url: string): Promise<Dict<string>> {
    logger.verbose(`Fetching fragments for URL: ${url}`);

    // Use YoutubeDL to fetch manifest URL
    const meta = await youtubedl.getVideoInfo(url);
    logger.verbose(`youtube-dl reported video manifest URL: ${meta.manifest_url}`);

    // Download video manifest
    const videoManifestRequest = await axios.get(meta.manifest_url);
    const videoManifest = videoManifestRequest.data;
    logger.verbose({videoManifest});

    // Grab the first stream listed in the manifest and hope it's the original quality
    const manifestUrlMatch = videoManifest.match(firstManifestStreamPattern);
    const manifestUrl = manifestUrlMatch[1];
    logger.verbose(`Selected manifest URL: ${manifestUrl}`);

    const manifestUrlParts = manifestUrl.split('/');
    const manifestBaseUrl = manifestUrlParts.slice(0, manifestUrlParts.length - 1).join('/');
    logger.verbose(`Computed base manifest URL: ${manifestBaseUrl}`);

    // Download the specific stream manifest
    const streamManifestRequest = await axios.get(manifestUrl);
    const streamManifest = streamManifestRequest.data;
    logger.verbose({streamManifest});

    // Match fragments listed in the manifest
    const matchedFragments = streamManifest.matchAll(manifestFragmentPattern);
    logger.verbose({matchedFragments});

    // Extract from match
    // FIXME: any
    const fragments = Array.from(matchedFragments).map((matches: any) => matches[1]);
    logger.verbose({fragments});

    // Join the base manifestUrl with fragment name
    const fragmentsUrl = fragments.reduce((result, frag) => {
        result[frag] = [manifestBaseUrl, frag].join('/');

        return result;
    }, {});

    logger.verbose({fragmentsUrl});

    return fragmentsUrl;
}
