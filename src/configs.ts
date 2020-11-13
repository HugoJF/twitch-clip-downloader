// Size of worker pool to fetch clips
export const API_INSTANCES = 20;

// How many youtube-dl instances to spawn to download media
export const YOUTUBEDL_INSTANCES: number = parseInt(process.env.YOUTUBEDL_INSTANCES || '3');

// Clip limit per period
export const BATCH_CLIP_THRESHOLD = 500;

// Where to store the API token
export const API_TOKEN_PATH = './token.txt';
