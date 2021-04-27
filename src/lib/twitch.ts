import axios                                    from 'axios';
import {HelixOptions, OAuth2Options, V5Options} from '../types';
import {apiDelay, convert, sleep}               from './utils';
import {logger}                                 from './logger';

export class Twitch {
    generateOauthTokenRequest(options: OAuth2Options) {
        return axios.request({
            baseURL: 'https://id.twitch.tv/oauth2/token',
            method: 'POST',
            ...options
        });
    }

    v5<T>(options: V5Options) {
        return axios.request<T>({
            baseURL: 'https://api.twitch.tv/v5',
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                'Client-ID': process.env.CLIENT_ID
            },
            ...options,
        });
    }

    async helix<T>(token: string, options: HelixOptions) {
        const request = await axios.request<T>({
            baseURL: 'https://api.twitch.tv/helix',
            headers: {
                Authorization: `Bearer ${token}`,
                'Client-ID': process.env.CLIENT_ID
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

    api(token: string) {
        return ({
            clips: (params: TwitchClipsApiParams) => {
                return this.helix<TwitchClipsApiResponse>(token, {
                    url: 'clips',
                    params
                });
            },
            users: (params: TwitchUsersApiParams) => {
                return this.helix<TwitchUsersApiResponse>(token, {
                    url: 'users',
                    params
                });
            },
            videos: (params: TwitchVideosApiParams) => {
                return this.helix<TwitchVideosApiResponse>(token, {
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

    async generateOauthToken(): Promise<string> {
        const response = await this.generateOauthTokenRequest({
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

        const token = response.data?.access_token;

        if (!token) {
            logger.error('API did not generate an access_token');
            logger.error(response.data);
            throw new Error('API did not generate an access_token');
        }

        return token.toString();
    }
}
