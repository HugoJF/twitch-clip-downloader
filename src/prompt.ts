import fs                   from 'fs';
import path                 from 'path';
import prompts              from 'prompts';
import {printErrorsAndExit} from './errors';
import {Stringable}         from './index';

type ValidatorOptions = prompts.PromptObject;
type PathOptions = {
    writable?: boolean;
}

export class Prompt {
    options: ValidatorOptions;
    pathOptions: PathOptions = {};

    constructor(protected name: string) {
        this.options = {name, type: 'text'};
    }

    message(message: string): Prompt {
        this.options.message = message;

        return this;
    }

    placeholder(initial: string | number | boolean | Date): Prompt {
        this.options.initial = initial;

        return this;
    }

    text(): Prompt {
        this.options.type = 'text';

        return this;
    }

    boolean(): Prompt {
        this.options.type = 'confirm';

        return this;
    }

    number(options: Partial<Pick<ValidatorOptions, 'min' | 'max' | 'float' | 'round'>>): Prompt {
        this.options.type = 'number';
        this.options = {...this.options, ...options};

        return this;
    }

    path(options: PathOptions = {}): Prompt {
        this.pathOptions = options;
        this.options.type = 'text';
        this.options.validate = this.validatePath;

        return this;
    }

    validatePath(input: string): boolean | string {
        const resolved = path.resolve(input);
        const testFile = path.resolve(resolved, 'test.txt');

        if (!fs.existsSync(resolved)) {
            return 'This path does not exist!';
        }

        if (!this.pathOptions.writable) {
            return true;
        }

        try {
            fs.writeFileSync(testFile, 'hello world');
            fs.unlinkSync(testFile);
        } catch (e) {
            return 'Failed to write test file to directory';
        }

        return true;
    }

    async prompt(): Promise<Stringable> {
        const response = await prompts(this.options);

        if (Object.keys(response).length === 0) {
            printErrorsAndExit(`Couldn't get ${this.name} input.`);
        }

        return response[this.name];
    }
}
