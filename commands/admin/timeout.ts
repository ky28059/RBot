import {createGuildOnlySlashCommand} from '../../utils/commands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {parseDurationArg} from '../../utils/argParser';
import {log} from '../../utils/logger';
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';


export const data = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Times out a user for the given duration and reason.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to time out.')
        .setRequired(true))
    .addStringOption(option => option
        .setName('duration')
        .setDescription('The length of the timeout.')
        .setRequired(true))
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for the timeout.'))

export default createGuildOnlySlashCommand<{user: User, duration: string, reason?: string}>({
    data,
    clientPermReqs: 'ModerateMembers',
    async execute(message, parsed, tag) {
        const guild = message.guild!;
        const member = guild.members.cache.get(parsed.user.id);

        const duration = parseDurationArg(parsed.duration, data.name, 'duration');

        if (!member)
            throw new IllegalArgumentError(data.name, '`member` must be a member of this server.');
        if (parsed.user.id === author(message).id)
            throw new ActionOnSelfError(data.name, 'target');
        if (!member.moderatable)
            throw new ActionUntakeableError(data.name, `${parsed.user} too high in hierarchy, unable to timeout.`)

        const reason = parsed.reason ?? 'No reason provided.';
        await member.timeout(duration, reason);

        await log(message.client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: parsed.user.tag, authorIcon: parsed.user.displayAvatarURL(),
            desc: `**${parsed.user} has been timed out by ${author(message)} for the reason:**\n${reason}`
        });
        await replyEmbed(message, success().setDescription(`Timed out ${parsed.user}.`))
    }
});
