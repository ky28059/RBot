import {createSlashCommand} from '../../utils/parseCommands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';


export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a song from the queue.')
    .setDMPermission(false)
    .addIntegerOption(option => option
        .setName('index')
        .setDescription('The (1-indexed) index to remove from the queue.')
        .setRequired(true))

export default createSlashCommand<{index: number}, true>(
    data,
    async (message, parsed) => {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const index = parsed.index;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('remove');
        if (!canModifyQueue(message.member!))
            throw new MemberNotInSameVCError('remove');
        if (index < 1 || index >= subscription.queue.length)
            throw new ActionUntakeableError('skipto', `Index \`${index}\` is not a valid index of the queue.`);

        const song = subscription.remove(index);
        await replyEmbed(message, success().setDescription(`❌ Song **${song.title}** was removed from the queue`));
    }, {
        examples: 'remove 5'
    }
);
