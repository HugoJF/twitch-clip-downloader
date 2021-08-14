import {Stringable} from './index';
import {Prompt}     from './prompt';

type Variable = {
    order: number;
    prompt?: Prompt;
    initial?: Stringable;
}

export class EnvironmentManager {
    index = 0;
    variables: Record<string, Variable> = {};

    register(name: string, initial?: Stringable, promptDefinition?: (prompt: Prompt) => void): void {
        const variable: Variable = {
            order: ++this.index,
            initial: initial,
        };

        if (promptDefinition) {
            variable.prompt = new Prompt(name);
            promptDefinition(variable.prompt);
        }

        this.variables[name] = variable;
    }

    async resolve() {
        const environment: Record<string, Stringable> = {};
        const variables = Object.entries(this.variables);
        const ordered = variables
            .sort(([, a], [, b]) => a.order - b.order);

        // Populate environment with values
        for (const [key, variable] of ordered) {
            if (process.env[key]) {
                environment[key] = process.env[key] as string;
            } else if (variable.prompt) {
                environment[key] = await variable.prompt.prompt();
            } else if (variable.initial) {
                environment[key] = variable.initial;
            }
        }

        return environment;
    }
}
