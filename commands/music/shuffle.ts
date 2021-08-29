import {RBot} from '../../bot';
import {Message} from 'discord.js';
import { canModifyQueue } from '../utils/canModifyQueue';
import {shuffle} from '../../utils/messages';

import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    name: 'shuffle',
    description: 'Shuffles the queue.',
    examples: 'shuffle',
    guildOnly: true,
    async execute(message: Message, parsed: {}, client: RBot) {
        const subscription = client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member!)) return;

        subscription.shuffle();
        await message.reply({embeds: [shuffle()]});
    }
};
