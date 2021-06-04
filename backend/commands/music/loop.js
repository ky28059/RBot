import { canModifyQueue } from "../utils/canModifyQueue.ts";
import {loop} from '../../utils/messages.ts';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError.ts';


export default {
    name: 'loop',
    aliases: ['l'],
    description: 'Toggles whether the bot will loop the queue.',
    examples: 'loop',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);

        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            return;

        // toggle from false to true and reverse
        queue.loop = !queue.loop;
        return queue.textChannel.send(loop(queue.loop))
    }
};