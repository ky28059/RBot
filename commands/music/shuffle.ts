import {createGuildOnlySlashCommand} from '../../utils/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {shuffle} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export const data = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the queue.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError(data.name);
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError(data.name);

        subscription.shuffle();
        await replyEmbed(message, shuffle());
    }
});
