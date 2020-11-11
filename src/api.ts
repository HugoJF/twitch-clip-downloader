import fs from "fs";
import * as twitch from "./twitch";

let _api: ReturnType<typeof twitch.api>;

export async function load () {
    let token: string;
    const path = './token.txt';

    try {
        const buffer = fs.readFileSync(path);
        token = buffer.toString();
        console.log('Read Twitch API OAuth2 token from file.');
    } catch (e) {
        console.log('Could not read Twich API OAuth2 token from file, generating another one...');

        token = await twitch.generateOauthToken();

        fs.writeFileSync(path, token);
    }

    _api = twitch.api(token);
}

export function api () {
    return _api;
}
