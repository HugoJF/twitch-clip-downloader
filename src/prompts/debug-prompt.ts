import prompts from "prompts";
import {printErrorsAndExit} from "../errors";

const debugPrompt = async () => {
    const response = await prompts({
        type:    'confirm',
        name:    'DEBUG',
        message: 'Run in debug mode?',
        initial: false,
        format:  (value: any) => value.toString()
    });

    if (Object.keys(response).length === 0) {
        printErrorsAndExit('Couldn\'t get DEBUG input.');
    }

    return response.DEBUG;
};

module.exports = debugPrompt;
