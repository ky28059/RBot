import ArgumentError from './ArgumentError.js';


// Thrown when an argument provided to a command is illegal
export default class IllegalArgumentError extends ArgumentError {
    constructor (commandName, message) {
        super(commandName, `Bad arguments to \`${commandName}\`: ${message}`);
        this.name = 'ILLEGAL_ARGUMENT_ERROR';
    }
}
