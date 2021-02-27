import { canModifyQueue } from '../utils/canModifyQueue.js';
import {success} from '../../utils/messages.js';

import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: 'skip',
    aliases: ['s'],
    description: 'Skips the currently playing song.',
    examples: 'skip',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            return;

        queue.playing = true;
        queue.connection.dispatcher.end();
        queue.textChannel.send(success({desc: `⏭ Skipped the song`})).catch(console.error);
    }
};