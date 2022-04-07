import {CommandInteraction, Message, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {log} from '../../utils/logger';
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';
import {Guild} from '../../models/Guild';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';
import IntegerConversionError from '../../errors/IntegerConversionError';
import IntegerRangeError from '../../errors/IntegerRangeError';


export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from this server.')
        .addUserOption(option => option
            .setName('target')
            .setDescription('The user to ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the ban'))
        .addIntegerOption(option => option
            .setName('days')
            .setDescription('How many days of messages to delete from that user')),
    examples: ['ban @example', 'ban @example "NSFW imagery"', 'ban @example "NSFW imagery" 7'],
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message: Message | CommandInteraction, parsed: {target: User, reason?: string, days?: number}, tag: Guild) {
        const guild = message.guild!;
        const target = guild.members.cache.get(parsed.target.id);

        if (!target)
            throw new IllegalArgumentError('kick', `${target} is not a valid GuildMember`);
        if (target.user.id === author(message).id)
            throw new ActionOnSelfError('ban', 'Target');
        if (!target.bannable)
            throw new ActionUntakeableError('ban', `${target} too high in hierarchy, unable to ban`);

        const reason = parsed.reason || "No reason provided";
        const days = parsed.days || 0;

        if (isNaN(days) || days % 1 !== 0)
            throw new IntegerConversionError('ban', 'Days');
        if (days < 0 || days > 7)
            throw new IntegerRangeError('ban', 'Days', 0, 7);

        await target.ban({days, reason});

        await log(message.client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: target.user.tag, authorIcon: target.user.displayAvatarURL(),
            desc: `**${target.user} has been banned by ${author(message)} for the reason:**\n${reason}`
        });
        await replyEmbed(message, success().setDescription(`Banned ${target}`));
    }
}
