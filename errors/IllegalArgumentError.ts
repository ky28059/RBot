import CommandError from './CommandError';


// Thrown when an argument provided to a command is illegal
export default class IllegalArgumentError extends CommandError {
    constructor (commandName: string, message: string) {
        super(commandName, message, 'ILLEGAL_ARGS');
        this.name = 'ILLEGAL_ARGUMENT_ERROR';
    }
}
