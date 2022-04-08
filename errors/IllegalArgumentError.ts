import ArgumentError from './ArgumentError';


// Thrown when an argument provided to a command is illegal
export default class IllegalArgumentError extends ArgumentError {
    constructor (commandName: string, message: string) {
        super(commandName, `Bad arguments to \`${commandName}\`: ${message}.`);
        this.name = 'ILLEGAL_ARGUMENT_ERROR';
    }
}
