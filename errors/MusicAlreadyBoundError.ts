import {StageChannel, VoiceChannel} from 'discord.js';
import ActionUntakeableError from './ActionUntakeableError';


// Thrown when a play command is used by someone not in the same VC as RBot.
export default class MusicAlreadyBoundError extends ActionUntakeableError {
    constructor (commandName: string, inChannel: VoiceChannel | StageChannel, reqChannel: VoiceChannel) {
        super(commandName, `Cannot join \`${reqChannel.name}\`, music already bound to \`${inChannel.name}\`.`);
        this.name = 'MUSIC_ALREADY_BOUND_ERROR';
    }
}
