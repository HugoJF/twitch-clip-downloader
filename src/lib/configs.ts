// Size of worker pool to fetch clips
export const API_INSTANCES = 20;

// Clip limit per period
export const BATCH_CLIP_THRESHOLD = 500;

// Where to store the API token
export const API_TOKEN_PATH = 'token.txt';

// Where preferences are stored
export const PREFERENCES_PATH = 'preferences.json';

// youtube-dl executable permission
export const YOUTUBEDL_PERMISSION = 0o775;

// youtube-dl download path (filename is 'youtube-dl' when OS is Linux, and 'youtube-dl.exe' when OS is windows')
export const YOUTUBEDL_URL = 'https://github.com/ytdl-org/youtube-dl/releases/latest/download/{filename}';
