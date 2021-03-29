import * as twitch           from './twitch';
import {API_TOKEN_PATH}      from './configs';
import {readFile, writeFile} from './filesystem';

type InstanceType = ReturnType<typeof twitch.api>;
let instance: InstanceType;

export async function loadApi (): Promise<void> {
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

export function api (): InstanceType {
    return instance;
}
