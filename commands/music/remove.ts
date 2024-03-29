import {createGuildOnlySlashCommand} from '../../util/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../util/canModifyQueue';
import {replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';

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

export default createGuildOnlySlashCommand<{index: number}>({
    data,
    examples: 'remove 5',
    async execute(message, parsed) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const index = parsed.index;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError(data.name);
        if (!canModifyQueue(message.member!))
            throw new MemberNotInSameVCError(data.name);
        if (index < 1 || index >= subscription.queue.length)
            throw new ActionUntakeableError(data.name, `Index \`${index}\` is not a valid index of the queue.`);

        const song = subscription.remove(index);
        await replyEmbed(message, success().setDescription(`❌ Song **${song.title}** was removed from the queue`));
    }
});
