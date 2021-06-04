import {Command} from '../../types/Command';
import {log} from '../utils/logger';

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import IntegerConversionError from '../../errors/IntegerConversionError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';
import IntegerRangeError from '../../errors/IntegerRangeError';


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

        const guild = message.guild!;
        const banTarget = guild.member(target);

        if (!banTarget)
            throw new ActionUntakeableError(this.name, `${target} not in server, unable to ban`);
        if (banTarget.user.id === message.author.id)
            throw new ActionOnSelfError(this.name, 'Target');
        if (!banTarget.bannable)
            throw new ActionUntakeableError(this.name, `${banTarget} too high in hierarchy, unable to ban`);

        if (!reason) reason = 'No reason provided'; // Default reason
        if (!days) days = 0; // Default days

        days = Number(days);
        if (isNaN(days) || days % 1 !== 0)
            throw new IntegerConversionError(this.name, 'Days');
        if (days < 0 || days > 7)
            throw new IntegerRangeError(this.name, 'Days', 0, 7);

        // Ban target
        await banTarget.ban({days: days, reason: reason});

        await log(client, guild, {
            id: tag.logchannel, color: '0x7f0000', author: banTarget.user.tag, authorIcon: banTarget.user.avatarURL(),
            desc: `**${banTarget.user} has been banned by ${message.author} for the reason:**\n${reason}`
        });
        await message.react('👌');
    }
} as Command;
