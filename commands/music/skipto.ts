import {createGuildOnlySlashCommand} from '../../utils/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export const data = new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skips the music to the provided index.')
    .setDMPermission(false)
    .addIntegerOption(option => option
        .setName('index')
        .setDescription('The (1-indexed) index to skip the queue to.')
        .setRequired(true))

export default createGuildOnlySlashCommand<{index: number}>({
    data,
    examples: 'skipto 3',
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

        // Set the index, then begin playing the next song.
        subscription.index = index - 1;
        subscription.next();

        await replyEmbed(message, success().setDescription(`Skipped to index **${index}**.`));
    }
});
