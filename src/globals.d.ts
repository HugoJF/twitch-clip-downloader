enum EnvironmentVariables {
    DEBUG,
    CLIENT_ID,
    CLIENT_SECRET,
    VIDEOS_PARALLEL_DOWNLOADS,
    CLIPS_PARALLEL_DOWNLOADS,
    BASEPATH,
    BIN_PATH,
    DEFAULT_PERIOD_HOURS,
}

type EnvironmentKeys = keyof typeof EnvironmentVariables;
type Environment = Record<keyof typeof EnvironmentVariables, string|boolean|number>;

interface Dict<T> {
    [key: string]: T;
}

interface YoutubeDlDumpHttpHeaders {
    'Accept-Charset': string,
    'Accept': string,
    'User-Agent': string,
    'Accept-Encoding': string,
    'Accept-Language': string
}

interface YoutubeDlClipDumpFormats {
    'ext': string,
    'height': number,
    'http_headers': YoutubeDlDumpHttpHeaders,
    'format_id': string,
    'protocol': string,
    'fps': number,
    'url': string,
    'format': string
}

interface YoutubeDlClipDumpThumbnails {
    'width': number,
    'height': number,
    'resolution': string,
    'url': string,
    'id': string
}

interface YoutubeDlClipDump {
    'http_headers': YoutubeDlDumpHttpHeaders,
    'thumbnail': string,
    'webpage_url_basename': string,
    'uploader': string,
    'uploader_id': string,
    'fps': number,
    'protocol': string,
    'id': string,
    'format': string,
    'views': number,
    'display_id': string,
    'upload_date': string,
    'requested_subtitles': any,
    'formats': YoutubeDlClipDumpFormats[],
    'extractor': string,
    'format_id': string,
    'ext': string,
    'webpage_url': string,
    'thumbnails': YoutubeDlClipDumpThumbnails[],
    'timestamp': number,
    'fulltitle': string,
    'playlist': any,
    'extractor_key': string,
    'creator': string,
    'height': number,
    'url': string,
    'playlist_index': any,
    '_filename': string,
    'duration': number,
    'title': string
}
