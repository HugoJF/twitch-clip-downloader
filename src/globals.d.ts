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
type Environment = Record<EnvironmentKeys, string|boolean|number>;

interface Dict<T> {
    [key: string]: T;
}

type Period = {
    left: Date,
    right: Date,
}

type HelixOptions = Omit<AxiosRequestConfig, 'baseURL' | 'headers'>
type OAuth2Options = Omit<AxiosRequestConfig, 'baseURL' | 'method'>
type TwitchClipsApiParams = {
    broadcaster_id: string,
    game_id?: string,
    id?: string,
    after?: string,
    before?: string,
    ended_at?: string,
    first?: number,
    started_at?: string,
};

type TwitchClipsApiResponse = {
    data: Clip[],
    pagination: {
        cursor: string
    }
}

type TwitchUsersApiParams = {
    id?: string,
    login?: string,
}

type TwitchUsersApiResponse = {
    data: User[],
}

type TwitchVideosApiParams = {
    user_id: string,
    game_id?: string,
    after?: string,
    before?: string,
    first?: number,
    language?: string,
    period?: string,
    sort?: string,
    type?: string,
};

type TwitchVideosApiResponse = {
    data: Video[],
    pagination: {
        cursor: string
    }
};

type User = {
    broadcaster_type: string,
    description: string,
    display_name: string,
    email: string,
    id: string,
    login: string,
    offline_image_url: string,
    profile_image_url: string,
    type: string,
    view_count: string,
    created_at: string,
}

type Clip = {
    broadcaster_id: string,
    broadcaster_name: string,
    created_at: string,
    creator_id: string,
    creator_name: string,
    embed_url: string,
    game_id: string,
    id: string,
    language: string,
    thumbnail_url: string,
    title: string,
    url: string,
    video_id: string,
    view_count: number,
}

type Video = {
    created_at: string,
    description: string,
    duration: string,
    id: string,
    language: string,
    published_at: string,
    thumbnail_url: string,
    title: string,
    type: string,
    url: string,
    user_id: string,
    user_name: string,
    view_count: number,
    viewable: string,
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
