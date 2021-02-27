import { canModifyQueue } from "../utils/canModifyQueue.js";
import {success} from '../../utils/messages.js';

import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: 'shuffle',
    description: 'Shuffles the queue.',
    usage: 'shuffle',
    examples: 'shuffle',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);

        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            return;

        let songs = queue.songs;
        for (let i = songs.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        queue.songs = songs;
        message.client.queue.set(message.guild.id, queue);
        queue.textChannel.send(success({desc: `🔀 Shuffled the queue`}));
    }
};