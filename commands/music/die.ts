import { canModifyQueue } from '../utils/canModifyQueue';
import {Message} from 'discord.js';
import {die} from '../../utils/messages';

import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    name: 'die',
    aliases: ['leave', 'dc'],
    description: 'Kills the music.',
    examples: 'die',
    guildOnly: true,
    async execute(message: Message) {
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member!)) return;

        subscription.voiceConnection.destroy();
        message.client.subscriptions.delete(message.guild!.id);

        await message.reply({embeds: [die()]});
    }
};
