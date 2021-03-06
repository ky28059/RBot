import {log} from "../utils/logger.js";

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';
import ActionOnSelfError from '../../errors/ActionOnSelfError.js';


export default {
    name: 'kick',
    description: 'Kick a user from this server.',
    pattern: '@[Target] <Reason>?',
    examples: 'kick @example Spamming in #general',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const target = guild.member(parsed.target);

        if (target.user.id === message.author.id)
            throw new ActionOnSelfError(this.name, 'Target');
        if (!target.kickable)
            throw new ActionUntakeableError(this.name, `${target} too high in hierarchy, unable to kick`);

        let reason = parsed.reason;
        if (!reason) reason = "No reason provided";

        await target.kick(reason);

        await log(client, guild, tag, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been kicked by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
