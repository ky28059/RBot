import CommandError from './CommandError';


// Thrown when required arguments are not passed to a command.
export default class MissingArgumentError extends CommandError {
    constructor (commandName: string, field: string) {
        super(commandName, `Missing required field \`${field}\` in \`${commandName}\`.`, 'MISSING_ARGS');
        this.name = 'MISSING_ARGUMENT_ERROR';
    }
}
