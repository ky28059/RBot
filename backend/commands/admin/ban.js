import {log} from "../utils/logger.js";
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';


export default {
    name: 'ban',
    description: 'Ban a user from this server.',
    pattern: '@[Target] [Reason]? [Days]?',
    examples: ['ban @example', 'ban @example "NSFW imagery"', 'ban @example "NSFW imagery" 7'],
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client, tag) {
        let {target, reason, days} = parsed;

        const guild = message.guild;
        target = guild.member(target);

        if (!reason) reason = "No reason provided"; // Default reason
        if (!days) days = 0; // Default days

        if (target.user.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
        if (!target.bannable)
            throw new ActionUntakeableError(this.name, `${target} too high in hierarchy, unable to ban`);
        if (days < 0 || days > 7)
            throw new IllegalArgumentError(this.name, '`Days` must be between 0 and 7');

        await target.ban({days: days, reason: reason});

        await log(client, guild, tag, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been banned by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
