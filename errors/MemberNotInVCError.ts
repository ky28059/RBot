import ActionUntakeableError from './ActionUntakeableError';


// Thrown when a play command is used by someone not in VC
export default class MemberNotInVCError extends ActionUntakeableError {
    constructor (commandName: string) {
        super(commandName, 'Member must be in a VC to invoke a play command');
        this.name = 'MEMBER_NOT_IN_VC_ERROR';
    }
}
