import {Message} from 'discord.js';
import { canModifyQueue } from '../utils/canModifyQueue';
import {skip} from '../../utils/messages';

import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: 'skip',
    aliases: ['s'],
    description: 'Skips the currently playing song.',
    examples: 'skip',
    guildOnly: true,
    async execute(message: Message) {
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member!)) return;

        // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
        // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
        // will be loaded and played.
        subscription.audioPlayer.stop();
        await message.reply({embeds: [skip()]});
    }
};
