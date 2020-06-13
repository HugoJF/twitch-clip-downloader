const clientIdPrompt     = require('./clientId-prompt');
const clientSecretPrompt = require('./clientSecret-prompt');
const debugPrompt        = require('./debug-prompt');
const youtubedlPrompt    = require('./youtubedl-prompt');

const envInfoPrompt = async () => {
    const CLIENT_ID = await clientIdPrompt();
    const CLIENT_SECRET = await clientSecretPrompt();
    const DEBUG = await debugPrompt();
    const YOUTUBEDL_INSTANCES = await youtubedlPrompt();

    return {CLIENT_ID, CLIENT_SECRET, DEBUG, YOUTUBEDL_INSTANCES};
};

module.exports = envInfoPrompt;
