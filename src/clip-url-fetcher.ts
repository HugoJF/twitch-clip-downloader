import {logger}  from './logger';
import youtubedl from './youtubedl';
import {Clip}    from './twitch';

export async function getClipUrl(clip: Clip): Promise<string> {
    logger.verbose(`Fetching clip URL for: ${clip.title}`);

    // Use YoutubeDL to fetch manifest URL
    try {
        const meta = (await youtubedl.getVideoInfo(clip.url)) as YoutubeDlClipDump;
        logger.verbose(`youtube-dl: ${clip.title} .mp4 file URL: ${meta.url}`);
        return meta.url;
    } catch (error) {
        logger.error(`youtube-dl: Failed to retrieve the clip URL for ${clip.title}`);
        return "";
    }
}
