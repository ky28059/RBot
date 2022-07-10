import {createSlashCommand} from '../../utils/parseCommands';
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

export default createSlashCommand<{index: number}, true>({
    data,
    examples: 'skipto 3',
    async execute(message, parsed) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const index = parsed.index;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('skipto');
        if (!canModifyQueue(message.member!))
            throw new MemberNotInSameVCError('skipto');

        // TODO: see todo in `purge.ts`
        if (index < 1 || index >= subscription.queue.length)
            throw new ActionUntakeableError('skipto', `Index \`${index}\` is not a valid index of the queue.`);

        // Set the index, then stop the audio player to begin playing the next song.
        subscription.index = index - 1;
        subscription.audioPlayer.stop();

        await replyEmbed(message, success().setDescription(`Skipped to index **${index}**.`));
    }
});
