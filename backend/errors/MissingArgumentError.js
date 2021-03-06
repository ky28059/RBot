import ArgumentError from './ArgumentError.js';


// Thrown when required arguments are not passed to a command
export default class MissingArgumentError extends ArgumentError {
    constructor (commandName, field) {
        super(commandName, `Missing field \`${field}\` to \`${commandName}\``);
        this.name = 'MISSING_ARGUMENT_ERROR';
    }
}