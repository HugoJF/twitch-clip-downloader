const twitch = require('./twitch');
const fs = require('fs');

let _api;

async function load() {
    let token = undefined;
    const path = './token.txt';

    try {
        token = fs.readFileSync(path);
        token = token.toString();
        console.log('Read Twitch API OAuth2 token from file.');
    } catch (e) {
        console.log('Could not read Twich API OAuth2 token from file, generating another one...');
        let response = await twitch.auth();
        token = response.data.access_token;
        fs.writeFileSync(path, token);
    }

    _api = twitch.api(token);
}

function api() {
    return _api;
}

module.exports = {api, load};