import clientIdPrompt from "./client-id-prompt";
import clientSecretPrompt from "./client-secret-prompt";
import debugPrompt from "./debug-prompt";
import youtubedlPrompt from "./youtubedl-prompt";

export const envPrompt = async () => {
    const CLIENT_ID = await clientIdPrompt();
    const CLIENT_SECRET = await clientSecretPrompt();
    const DEBUG = await debugPrompt();
    const YOUTUBEDL_INSTANCES = await youtubedlPrompt();

    return { CLIENT_ID, CLIENT_SECRET, DEBUG, YOUTUBEDL_INSTANCES };
};
