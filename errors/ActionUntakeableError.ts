import CommandError from './CommandError';


// Represents an untakeable action, whether from hierarchy or other restrictions
export default class ActionUntakeableError extends CommandError {
    constructor (commandName: string, message: string) {
        super(commandName, message, 'ACTION_UNTAKEABLE');
        this.name = 'ACTION_UNTAKEABLE_ERROR';
    }
}
