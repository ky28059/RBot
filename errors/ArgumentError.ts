import CommandError from './CommandError';


// Represents an error in the arguments of a command
export default class ArgumentError extends CommandError {
    constructor (commandName: string, message: string) {
        super(commandName, message);
        this.name = 'ARGUMENT_ERROR';
    }
}
