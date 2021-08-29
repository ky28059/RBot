import { canModifyQueue } from "../utils/canModifyQueue.js";
import {success} from '../../utils/messages.js';

// Errors
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';
import QueueNonexistentError from '../../errors/QueueNonexistentError.js';
import IntegerConversionError from '../../errors/IntegerConversionError.js';
import IntegerRangeError from '../../errors/IntegerRangeError.js';


export default {
    name: 'remove',
    description: 'Removes a song from the queue.',
    pattern: '[Number]',
    examples: 'remove 5',
    guildOnly: true,
    execute(message, parsed) {
        let num = parsed.number;
        const queue = message.client.queue.get(message.guild.id);

        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            // shaky
            throw new ActionUntakeableError(this.name, 'User must join the voice channel first');

        num = Number(num);
        if (isNaN(num) || num % 1 !== 0)
            throw new IntegerConversionError(this.name, 'Number');
        if (num < 1)
            throw new IntegerRangeError(this.name, 'Number', 1);

        const song = queue.songs.splice(num - 1, 1);
        queue.textChannel.send(success({desc: `❌ Song **${song[0].title}** was removed from the queue`}));
    }
};