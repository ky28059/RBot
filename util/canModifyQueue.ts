import {GuildMember} from 'discord.js';

/**
 * Gets whether a server member can modify the server's music queue.
 * @param member The `GuildMember` to check.
 * @returns Whether they can modify the queue.
 */
// TODO: move this function elsewhere
export function canModifyQueue(member: GuildMember) {
    const { channel } = member.voice;
    const botChannel = member.guild.members.me!.voice.channel;

    return channel === botChannel;
}
