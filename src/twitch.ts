import axios, {AxiosRequestConfig} from "axios";
import {apiDelay, debug, sleep} from "./utils";

export type HelixOptions = Omit<AxiosRequestConfig, "baseURL" | "Headers">
export type OAuth2Options = Omit<AxiosRequestConfig, "baseURL" | "method">
export type TwitchClipsApiParams = {
    broadcaster_id: string,
    game_id?: string,
    id?: string,
    after?: string,
    before?: string,
    ended_at?: string,
    first?: number,
    started_at?: string,
};

export type TwitchClipsApiResponse = {
    data: Clip[],
    pagination: {
        cursor: string
    }
}

export type TwitchUsersApiParams = {
    id?: string,
    login?: string,
}

export type TwitchUsersApiResponse = {
    data: User[],
}

export type User = {
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

export type Clip = {
    broadcaster_id: string,
    broadcaster_name: string,
    created_at: string,
    creator_id: string,
    creator_name: string,
    embed_url: string,
    game_id: string,
    id: string,
    language: string,
    pagination: string,
    thumbnail_url: string,
    title: string,
    url: string,
    video_id: string,
    view_count: number,
}

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
        const delay = apiDelay(parseInt(rateLimitRemaining), parseInt(rateLimitLimit), 60 * 1000 /* millis */);
        debug(`Delaying API response by ${delay}ms. Rate limit ${rateLimitRemaining}/${rateLimitLimit}`);
        await sleep(delay);
    } else {
        debug('Could not read API rate-limit headers', request.headers);
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
        debug(response.data);
        throw new Error(response.statusText);
    }

    const token = response.data?.access_token;

    if (!token) {
        console.log(`API did not generate an access_token`);
        debug(response.data);
        throw new Error('API did not generate an access_token');
    }

    return token.toString();
}
