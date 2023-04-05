import {createGuildOnlySlashCommand} from '../../util/commands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {log} from '../../util/logging';
import {author, replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';
import IntegerRangeError from '../../errors/IntegerRangeError';


export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from this server.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => option
        .setName('target')
        .setDescription('The user to ban.')
        .setRequired(true))
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for the ban.'))
    .addIntegerOption(option => option
        .setName('days')
        .setDescription('How many days of messages to delete from that user.')
        .setMinValue(0)
        .setMaxValue(7))

export default createGuildOnlySlashCommand<{target: User, reason?: string, days?: number}>({
    data,
    examples: ['ban @example', 'ban @example "NSFW imagery"', 'ban @example "NSFW imagery" 7'],
    clientPermReqs: 'BanMembers',
    async execute(message, parsed, tag) {
        const guild = message.guild!;
        const target = guild.members.cache.get(parsed.target.id);

        if (!target)
            throw new IllegalArgumentError(data.name, `${parsed.target} is not a valid GuildMember.`);
        if (target.user.id === author(message).id)
            throw new ActionOnSelfError(data.name, 'target');
        if (!target.bannable)
            throw new ActionUntakeableError(data.name, `${target} too high in hierarchy, unable to ban.`);

        const reason = parsed.reason ?? 'No reason provided.';
        const days = parsed.days ?? 0;

        await target.ban({deleteMessageDays: days, reason});

        await log(message.client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: target.user.tag, authorIcon: target.user.displayAvatarURL(),
            desc: `**${target} has been banned by ${author(message)} for the reason:**\n${reason}`
        });
        await replyEmbed(message, success().setDescription(`Banned ${target}.`));
    }
});
