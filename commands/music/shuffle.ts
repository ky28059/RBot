import {CommandInteraction, GuildMember, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {shuffle} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the queue.'),
    examples: 'shuffle',
    guildOnly: true,
    async execute(message: Message | CommandInteraction) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError('shuffle');
        if (!canModifyQueue(message.member)) return;

        subscription.shuffle();
        await replyEmbed(message, shuffle());
    }
};
