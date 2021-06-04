import { canModifyQueue } from '../utils/canModifyQueue.ts';
import {skip} from '../../utils/messages.ts';

import QueueNonexistentError from '../../errors/QueueNonexistentError.ts';


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
        queue.textChannel.send(skip());
    }
};