import {CommandInteraction, GuildMember, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError';
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import IntegerConversionError from '../../errors/IntegerConversionError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export default {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skips the music to the provided index.')
        .addIntegerOption(option => option
            .setName('index')
            .setDescription('The (1-indexed) index to skip the queue to.')
            .setRequired(true)),
    examples: 'skipto 3',
    guildOnly: true,
    async execute(message: Message | CommandInteraction, parsed: {index: number}) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const index = parsed.index;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('skipto');
        if (!canModifyQueue(message.member!))
            throw new MemberNotInSameVCError('skipto');

        if (isNaN(index) || index % 1 !== 0)
            throw new IntegerConversionError('skipto', 'index');
        if (index < 1 || index >= subscription.queue.length)
            throw new ActionUntakeableError('skipto', `Index \`${index}\` is not a valid index of the queue`);

        // Set the index, then stop the audio player to begin playing the next song.
        subscription.index = index - 1;
        subscription.audioPlayer.stop();

        await replyEmbed(message, success().setDescription(`Skipped to index **${index}**.`));
    }
};
