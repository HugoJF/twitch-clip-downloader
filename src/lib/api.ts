import {API_TOKEN_PATH}      from './configs';
import {readFile, writeFile} from './filesystem';
import {Twitch}              from './twitch';

type Instance = ReturnType<Twitch['api']>;
let instance: Instance;

export async function loadApi(): Promise<void> {
    const twitch = new Twitch;
    let token: string;

    try {
        const buffer = await readFile(API_TOKEN_PATH);
        token = buffer.toString();
        console.log('Read Twitch API OAuth2 token from file.');
    } catch (e) {
        console.log('Could not read Twich API OAuth2 token from file, generating another one...');

        token = await twitch.generateOauthToken();

        writeFile(API_TOKEN_PATH, token);
    }

    instance = twitch.api(token);
}

export function api(): Instance {
    return instance;
}
