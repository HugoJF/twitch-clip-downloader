import chalk                                                  from 'chalk';
import dotenv                                                 from 'dotenv';
import {appPath, Environment, EnvironmentKeys, exists, write} from 'twitch-tools';
import {definition}                                           from './environment-definition';

const envPath = appPath('.env');

const checkEnvExists = async () => {
    const envExists = await exists(envPath);

    if (!envExists) {
        console.log(`Looks like you haven't set your ${chalk.cyan('.env')} file yet!`);
        console.log(`We'll now generate this file, so have your Twitch ${chalk.green('CLIENT_ID')} and ${chalk.green('CLIENT_SECRET')} ready!\n`);
        console.log('If you don\'t have these at hand, here\'s a guide:');
        console.log(`Register an application on ${chalk.magenta('Twitch')} Console: ${chalk.underline.blue('https://dev.twitch.tv/console/apps')}`);
        console.log(`Click ${chalk.cyan('Manage')} and copy the ${chalk.green('CLIENT_ID')} and generate a ${chalk.green('CLIENT_SECRET')}.\n\n`);
    }
};

export const loadEnvironment = (): void => {
    dotenv.config({path: envPath});
};

export const ensureConfigsAreLoaded = async (): Promise<void> => {
    await checkEnvExists();

    loadEnvironment();

    const env = await definition.resolve();

    await writeEnvFile(env);
};

export const writeEnvFile = async (config: Partial<Environment> = {}): Promise<void> => {
    const lines = Object.keys(config).map(key => [key, config[key as EnvironmentKeys]].join('='));
    const fileContent = lines.join('\n');

    return write(envPath, fileContent);
};
