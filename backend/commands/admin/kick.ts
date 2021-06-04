import {Command} from '../../types/Command';
import {log} from '../utils/logger';

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';


export default {
    name: 'kick',
    description: 'Kick a user from this server.',
    pattern: '@[Target] <Reason>?',
    examples: 'kick @example Spamming in #general',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild!;
        const target = guild.member(parsed.target);

        if (!target)
            throw new ActionUntakeableError(this.name, `${target} not in server, unable to kick`);
        if (target.user.id === message.author.id)
            throw new ActionOnSelfError(this.name, 'Target');
        if (!target.kickable)
            throw new ActionUntakeableError(this.name, `${target} too high in hierarchy, unable to kick`);

        let reason = parsed.reason;
        if (!reason) reason = 'No reason provided';

        await target.kick(reason);

        await log(client, guild, {
            id: tag.logchannel, color: '0x7f0000', author: target.user.tag, authorIcon: target.user.avatarURL(),
            desc: `**${target.user} has been kicked by ${message.author} for the reason:**\n${reason}`
        });
        await message.react('👌');
    }
} as Command;
