import {createGuildOnlySlashCommand} from '../../utils/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {skip} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    aliases: ['s'],
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('skip');
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError('skip');

        subscription.next();
        await replyEmbed(message, skip());
    }
});
