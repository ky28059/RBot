import {SlashCommand} from '../../utils/parseCommands';
import {User} from 'discord.js';
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


const command: SlashCommand<{target: User, reason?: string}, true> = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from this server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions('KICK_MEMBERS')
        .addUserOption(option => option
            .setName('target')
            .setDescription('The user to kick.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the kick.')),
    examples: 'kick @example "Spamming in #general"',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message, parsed, tag) {
        const guild = message.guild!;
        const target = guild.members.cache.get(parsed.target.id);

        if (!target)
            throw new IllegalArgumentError('kick', `${parsed.target} is not a valid GuildMember.`);
        if (target.user.id === author(message).id)
            throw new ActionOnSelfError('kick', 'target');
        if (!target.kickable)
            throw new ActionUntakeableError('kick', `${target} too high in hierarchy, unable to kick.`);

        const reason = parsed.reason || 'No reason provided.';
        await target.kick(reason);

        await log(message.client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: target.user.tag, authorIcon: target.user.displayAvatarURL(),
            desc: `**${target.user} has been kicked by ${author(message)} for the reason:**\n${reason}`
        });
        await replyEmbed(message, success().setDescription(`Kicked ${target}.`));
    }
}

export default command;
