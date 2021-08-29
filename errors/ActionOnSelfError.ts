import IllegalArgumentError from './IllegalArgumentError';


// Thrown when a user attempts to take action on themselves
export default class ActionOnSelfError extends IllegalArgumentError {
    constructor (commandName: string, field: string) {
        super(commandName, `Field \`${field}\` cannot be yourself`);
        this.name = 'ACTION_ON_SELF_ERROR';
    }
}
