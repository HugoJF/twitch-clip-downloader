import path                 from 'path';
import chalk                from 'chalk';
import dotenv               from 'dotenv';
import {printErrorsAndExit} from './errors';
import {exists, write}      from '../lib/filesystem';
import {envPrompt}          from './env-prompt';

const envPath = path.resolve(path.join(__dirname, '..', '.env'));

const DEFAULTS: Record<string, number | boolean | string> = {
    DEBUG: false,
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    VIDEOS_PARALLEL_DOWNLOADS: 20,
    CLIPS_PARALLEL_DOWNLOADS: 10,
    YOUTUBE_DL_PATH: './bin/youtube-dl.exe',
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

export const ensureConfigsAreLoaded = async (): Promise<void> => {
    await createIfEnvNotSet();

    loadEnvironment();

    const environmentKeys = Object.keys(DEFAULTS);

    environmentKeys.forEach(ensureEnvironmentKeyIsLoaded);
};

export const writeEnvFile = async (values: Record<string, any> = {}): Promise<void> => {
    const config = {...DEFAULTS, ...values};

    const pieces = Object.keys(config).map(key => `${key}=${config[key].toString()}`);
    const fileContent = pieces.join('\n');

    return write(envPath, fileContent);
};
