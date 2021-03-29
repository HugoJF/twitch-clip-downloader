import axios                      from 'axios';
import {apiDelay, convert, sleep} from './utils';
import {logger}                   from './logger';

const helix = async <T>(token: string, options: HelixOptions) => {
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
};

const generateOauthTokenRequest = (options: OAuth2Options) => axios.request({
    baseURL: 'https://id.twitch.tv/oauth2/token',
    method: 'POST',
    ...options
});

export const api = (token: string) => ({
    clips: function (params: TwitchClipsApiParams) {
        return helix<TwitchClipsApiResponse>(token, {
            url: 'clips',
            params
        });
    },
    users: function (params: TwitchUsersApiParams) {
        return helix<TwitchUsersApiResponse>(token, {
            url: 'users',
            params
        });
    },
    videos: function (params: TwitchVideosApiParams) {
        return helix<TwitchVideosApiResponse>(token, {
            url: 'videos',
            params,
        });
    }
});

export async function generateOauthToken(): Promise<string> {
    const response = await generateOauthTokenRequest({
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
