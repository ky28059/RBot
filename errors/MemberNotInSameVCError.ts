import ActionUntakeableError from './ActionUntakeableError';


// Thrown when a music command is used by a member not in the same VC as the bot
export default class MemberNotInSameVCError extends ActionUntakeableError {
    constructor (commandName: string) {
        super(commandName, 'Member must be in the same VC as RBot to modify the queue');
        this.name = 'MEMBER_NOT_IN_SAME_VC_ERROR';
    }
}
