import {EnvironmentManager} from './environment-manager';
import {appPath}            from 'twitch-tools';

export const definition = new EnvironmentManager;

definition.register('CLIENT_ID', '', prompt => prompt
    .message('What is your Twitch CLIENT_ID?')
    .text()
);
definition.register('CLIENT_SECRET', '', prompt => prompt
    .message('What is your Twitch CLIENT_SECRET?')
    .text()
);
definition.register('BASEPATH', '', prompt => prompt
    .message('Where should videos and clips be stored?')
    .placeholder(process.cwd())
    .path({writable: true})
);
definition.register('VIDEOS_PARALLEL_DOWNLOADS', 20, prompt => prompt
    .message('How many video fragments should be downloaded at the same time?')
    .placeholder(20)
    .number({min: 1})
);
definition.register('CLIPS_PARALLEL_DOWNLOADS', 20, prompt => prompt
    .message('How many clips should be downloaded at the same time?')
    .number({min: 1})
    .placeholder(20)
);
definition.register('DEBUG', false, prompt => prompt
    .message('Run in debug mode?')
    .boolean()
    .placeholder(false)
);
definition.register('BIN_PATH', appPath());
definition.register('DEFAULT_PERIOD_HOURS', 24);
