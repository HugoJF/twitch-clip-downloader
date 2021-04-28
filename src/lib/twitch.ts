import axios                                    from 'axios';
import {HelixOptions, OAuth2Options, V5Options} from '../types';
import {apiDelay, convert, sleep}               from './utils';
import {logger}                                 from './logger';
import {readFile, writeFile}                    from './filesystem';
import {API_TOKEN_PATH}                         from './configs';

let _instance: Twitch;

export async function loadInstance(clientId: string): Promise<void> {
    _instance = new Twitch(clientId);

    return _instance.load();
}

export function instance(): Twitch {
    return _instance;
}

export class Twitch {
    private readonly clientId: string;

    private token: string;

    constructor(clientId: string) {
        this.clientId = clientId;
        this.token = '';
    }

    async load(): Promise<void> {
        try {
            const buffer = await readFile(API_TOKEN_PATH);
            this.token = buffer.toString();
            console.log('Read Twitch API OAuth2 token from file.');
        } catch (e) {
            console.log('Could not read Twich API OAuth2 token from file, generating another one...');

            await this.generateToken();
        }
    }

    v5<T>(options: V5Options) {
        return axios.request<T>({
            baseURL: 'https://api.twitch.tv/v5',
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.clientId,
            },
            ...options,
        });
    }

    async helix<T>(token: string, options: HelixOptions) {
        const request = await axios.request<T>({
            baseURL: 'https://api.twitch.tv/helix',
            headers: {
                Authorization: `Bearer ${token}`,
                'Client-ID': this.clientId,
            },
            ...options
        });

        const rateLimitRemaining = request.headers?.['ratelimit-remaining'];
        const rateLimitLimit = request.headers?.['ratelimit-limit'];

        if (rateLimitLimit && rateLimitRemaining) {
            const delay = apiDelay(
                parseInt(rateLimitRemaining),
                parseInt(rateLimitLimit),
                convert(60).seconds.to.millis()
            );
            logger.info(`Delaying API response by ${delay}ms. Rate limit ${rateLimitRemaining}/${rateLimitLimit}`);
            await sleep(delay);
        } else {
            logger.warning('Could not read API rate-limit headers', request.headers);
        }

        return request;
    }

    api() {
        return ({
            clips: (params: TwitchClipsApiParams) => {
                return this.helix<TwitchClipsApiResponse>(this.token, {
                    url: 'clips',
                    params
                });
            },
            users: (params: TwitchUsersApiParams) => {
                return this.helix<TwitchUsersApiResponse>(this.token, {
                    url: 'users',
                    params
                });
            },
            videos: (params: TwitchVideosApiParams) => {
                return this.helix<TwitchVideosApiResponse>(this.token, {
                    url: 'videos',
                    params,
                });
            },
            videoComments: (videoId: number | string, params: TwitchVideoCommentsApiParams) => {
                return this.v5<TwitchVideoCommentsApiResponse>({
                    url: `videos/${videoId}/comments`,
                    params,
                });
            },
        });
    }

    tokenRequest(options: OAuth2Options) {
        return axios.request({
            baseURL: 'https://id.twitch.tv/oauth2/token',
            method: 'POST',
            ...options
        });
    }

    async generateToken(): Promise<string> {
        const response = await this.tokenRequest({
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                scope: '',
                grant_type: 'client_credentials'
            }
        });

        if (response.status !== 200 && response.status !== 201) {
            console.log(`Failed to generate Twitch API token, response status: ${response.status}`);
            logger.verbose({responseData: response.data});
            throw new Error(response.statusText);
        }

        this.token = response.data?.access_token;

        if (!this.token) {
            logger.error('API did not generate an access_token');
            logger.error(response.data);
            throw new Error('API did not generate an access_token');
        }

        writeFile(API_TOKEN_PATH, this.token);

        return this.token.toString();
    }
}
