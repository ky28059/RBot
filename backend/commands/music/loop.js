import { canModifyQueue } from "../utils/canModifyQueue.js";

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';
import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: "loop",
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
        return queue.textChannel.send(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
    }
};