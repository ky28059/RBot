import CommandError from './CommandError.js';


// Thrown when a play command is used by someone not in the same VC as RBot
export default class MusicAlreadyBoundError extends CommandError {
    constructor (commandName, inChannel, reqChannel) {
        super(commandName, `Cannot join \`${reqChannel.name}\`, music already bound to \`${inChannel.name}\``);
        this.name = 'MUSIC_ALREADY_BOUND_ERROR';
    }
}
