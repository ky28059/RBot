import { canModifyQueue } from "../utils/canModifyQueue.js";
import {success} from '../../utils/messages.js';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';
import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: "remove",
    description: 'Removes a song from the queue.',
    pattern: '[Number]',
    examples: 'remove 5',
    guildOnly: true,
    execute(message, parsed) {
        const num = parsed.number;
        const queue = message.client.queue.get(message.guild.id);

        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            // shaky
            throw new ActionUntakeableError(this.name, 'User must join the voice channel first');

        if (isNaN(num))
            throw new IllegalArgumentError(this.name, 'Field `Number` must be a valid integer');

        const song = queue.songs.splice(num - 1, 1);
        queue.textChannel.send(success({desc: `❌ Song **${song[0].title}** was removed from the queue`}));
    }
};