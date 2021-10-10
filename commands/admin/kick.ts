import {CommandInteraction, Message, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {log} from '../utils/logger';
import {author, reply} from '../../utils/messageUtils';
import {success} from '../../utils/messages';
import {Guild} from '../../models/Guild';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import ActionOnSelfError from '../../errors/ActionOnSelfError';


export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from this server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')),
    examples: 'kick @example "Spamming in #general"',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message: Message | CommandInteraction, parsed: {target: User, reason?: string}, tag: Guild) {
        const guild = message.guild!;
        const target = guild.members.cache.get(parsed.target.id);

        if (!target)
            throw new IllegalArgumentError('kick', `${target} is not a valid GuildMember`);
        if (target.user.id === author(message).id)
            throw new ActionOnSelfError('kick', 'Target');
        if (!target.kickable)
            throw new ActionUntakeableError('kick', `${target} too high in hierarchy, unable to kick`);

        const reason = parsed.reason || 'No reason provided';
        await target.kick(reason);

        await log(message.client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: target.user.tag, authorIcon: target.user.displayAvatarURL(),
            desc: `**${target.user} has been kicked by ${author(message)} for the reason:**\n${reason}`
        });
        await reply(message, {embeds: [success({desc: `Kicked ${target}`})]});
    }
}
