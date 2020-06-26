const axios = require('axios');

const helix = (token, options) => axios.request({
    baseURL: 'https://api.twitch.tv/helix',
    headers: {
        Authorization: `Bearer ${token}`,
        'Client-ID':   process.env.CLIENT_ID
    },
    ...options
});

const oauth2 = (options) => axios.request({
    baseURL: 'https://id.twitch.tv/oauth2/token',
    method:  'POST',
    ...options
});

const api = (token) => ({
    clips: function (params) {
        return helix(token, {
            url: 'clips',
            params
        });
    },
    users: function (login) {
        return helix(token, {
            url:    'users',
            params: { login }
        });
    }
});

const auth = function () {
    return oauth2({
        params: {
            client_id:     process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope:         '',
            grant_type:    'client_credentials'
        }
    });
};

module.exports = { api, auth };
