import axios, {AxiosRequestConfig} from "axios";

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

const helix = <T>(token: string, options: HelixOptions) => axios.request<T>({
    baseURL: 'https://api.twitch.tv/helix',
    headers: {
        Authorization: `Bearer ${token}`,
        'Client-ID': process.env.CLIENT_ID
    },
    ...options
});

const oauth2 = (options: OAuth2Options) => axios.request({
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

export function auth() {
    return oauth2({
        params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: '',
            grant_type: 'client_credentials'
        }
    });
}
