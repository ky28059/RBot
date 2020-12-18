import CommandError from './CommandError.js';


// Represents an error finding the arguments for a command
export default class ArgumentError extends CommandError {
    constructor (commandName, message) {
        super(commandName, message);
        this.name = 'ARGUMENT_ERROR';
    }
}
