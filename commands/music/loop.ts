import {createGuildOnlySlashCommand} from '../../utils/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import { canModifyQueue } from '../../utils/canModifyQueue';
import {loop, success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggles whether the bot will loop the queue.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    aliases: ['l'],
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError(data.name);
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError(data.name);

        // Toggle the queue loop
        subscription.queueLoop = !subscription.queueLoop;
        return replyEmbed(message, loop(subscription.queueLoop));
    }
});
