// Size of worker pool to fetch clips
export const API_INSTANCES = 20;

// How many clips to download at the same time
export const CLIPS_PARALLEL_DOWNLOADS: number = parseInt(process.env.CLIPS_PARALLEL_DOWNLOADS || '10');

// How many clips to download at the same time
export const VIDEOS_PARALLEL_DOWNLOADS: number = parseInt(process.env.VIDEOS_PARALLEL_DOWNLOADS || '10');

// Clip limit per period
export const BATCH_CLIP_THRESHOLD = 500;

// Where to store the API token
export const API_TOKEN_PATH = './token.txt';
