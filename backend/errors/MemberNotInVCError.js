import CommandError from './CommandError.js';


// Thrown when a play command is used by someone not in VC
export default class MemberNotInVCError extends CommandError {
    constructor (commandName) {
        super(commandName, 'Member must be in VC to invoke a play command');
        this.name = 'MEMBER_NOT_IN_VC_ERROR';
    }
}
