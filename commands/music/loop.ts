import {CommandInteraction, GuildMember, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import { canModifyQueue } from '../../utils/canModifyQueue';
import {loop, success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles whether the bot will loop the queue.'),
    aliases: ['l'],
    examples: 'loop',
    guildOnly: true,
    execute(message: Message | CommandInteraction) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError('loop');
        if (!canModifyQueue(message.member)) return;

        // Toggle the queue loop
        subscription.queueLoop = !subscription.queueLoop;
        return replyEmbed(message, loop(subscription.queueLoop));
    }
};
