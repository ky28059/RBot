import CommandError from './CommandError';


// Thrown when a queue requiring command is used when the queue does not exist
export default class QueueNonexistentError extends CommandError {
    constructor (commandName: string) {
        super(commandName, 'Server queue nonexistent');
        this.name = 'QUEUE_NONEXISTENT_ERROR';
    }
}
