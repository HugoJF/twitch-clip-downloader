import Command, {flags} from '@oclif/command';
import {ensureConfigsAreLoaded} from '../../src2/environment';
import {bootLogger, loadInstance} from '../../../twitch-tools';
import {bootLogger as bootLocalLogger} from '../../src2/logger';

export abstract class BaseCommand extends Command {
    async init() {
        await ensureConfigsAreLoaded();

        bootLogger(process.env.DEBUG === 'true');
        bootLocalLogger(process.env.DEBUG === 'DEBUG');

        await loadInstance(process.env.CLIENT_ID ?? '', process.env.CLIENT_SECRET ?? '');
    }
}
