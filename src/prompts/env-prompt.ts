const clientIdPrompt     = require('./client-id-prompt');
const clientSecretPrompt = require('./client-secret-prompt');
const debugPrompt        = require('./debug-prompt');
const youtubedlPrompt    = require('./youtubedl-prompt');

export const envPrompt = async () => {
    const CLIENT_ID = await clientIdPrompt();
    const CLIENT_SECRET = await clientSecretPrompt();
    const DEBUG = await debugPrompt();
    const YOUTUBEDL_INSTANCES = await youtubedlPrompt();

    return { CLIENT_ID, CLIENT_SECRET, DEBUG, YOUTUBEDL_INSTANCES };
};
