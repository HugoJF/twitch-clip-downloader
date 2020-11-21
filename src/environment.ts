import dotenv               from "dotenv";
import path                 from "path";
import chalk                from "chalk";
import {envPrompt}          from "./prompts/env-prompt";
import {exists, write}      from "./filesystem";
import {printErrorsAndExit} from "./errors";

const envPath = path.resolve(path.join(__dirname, '..', '.env'));

const DEFAULTS: object = {
    DEBUG:               false,
    CLIENT_ID:           '',
    CLIENT_SECRET:       '',
    YOUTUBEDL_INSTANCES: 3
};

const loadEnvironment = () => {
    dotenv.config();
};

const ensureEnvironmentKeyIsLoaded = (key: string) => {
    if (!process.env[key]) {
        printErrorsAndExit(`Environment variable ${chalk.underline.blue(key)} not set!`,
            `\nPlease set ${chalk.blue(key)} on ${chalk.cyan('.env')} file.`);
    }
};

const createIfEnvNotSet = async () => {
    const envExists = await exists(envPath);

    if (!envExists) {
        console.log(`Looks like you haven't set your ${chalk.cyan('.env')} file yet!`);
        console.log(`We'll now generate this file, so have your Twitch ${chalk.green('CLIENT_ID')} and ${chalk.green('CLIENT_SECRET')} ready!\n`);
        console.log('If you don\'t have these at hand, here\'s a guide:');
        console.log(`Register an application on ${chalk.magenta('Twitch')} Console: ${chalk.underline.blue('https://dev.twitch.tv/console/apps')}`);
        console.log(`Click ${chalk.cyan('Manage')} and copy the ${chalk.green('CLIENT_ID')} and generate a ${chalk.green('CLIENT_SECRET')}.\n\n`);

        const data = await envPrompt();

        await writeEnvFile(data);
    }
};

export const ensureConfigsAreLoaded = async () => {
    await createIfEnvNotSet();

    loadEnvironment();

    const environmentKeys = Object.keys(DEFAULTS);

    environmentKeys.forEach(ensureEnvironmentKeyIsLoaded);
};

export const writeEnvFile = async (values: object = {}) => {
    const config = {...DEFAULTS, ...values};

    // @ts-ignore
    const pieces = Object.keys(config).map(key => `${key}=${config[key].toString()}`);
    const fileContent = pieces.join('\n');

    return write(envPath, fileContent);
};
