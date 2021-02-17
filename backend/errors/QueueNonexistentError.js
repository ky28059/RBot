import CommandError from './CommandError.js';


// Represents an error finding the arguments for a command
export default class QueueNonexistentError extends CommandError {
    constructor (commandName) {
        super(commandName, 'Server queue nonexistent');
        this.name = 'QUEUE_NONEXISTENT_ERROR';
    }
}
