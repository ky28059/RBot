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
import IntegerRangeError from '../../errors/IntegerRangeError';


export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a song from the queue.')
        .addIntegerOption(option => option
            .setName('index')
            .setDescription('The index to remove from the queue.')
            .setRequired(true)),
    examples: 'remove 5',
    guildOnly: true,
    async execute(message: Message | CommandInteraction, parsed: {index: number}) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const index = parsed.index;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('remove');
        if (!canModifyQueue(message.member!))
            throw new ActionUntakeableError('remove', 'User must join the voice channel first');

        if (isNaN(index) || index % 1 !== 0)
            throw new IntegerConversionError('remove', 'Number');
        if (index < 1)
            throw new IntegerRangeError('remove', 'Number', 1);

        const song = subscription.remove(index);
        await replyEmbed(message, success().setDescription(`❌ Song **${song.title}** was removed from the queue`));
    }
};
