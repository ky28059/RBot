import { canModifyQueue } from "../utils/canModifyQueue.js";
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';

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
            throw new ActionUntakeableError(this.name, 'The queue for this server is nonexistent');
        if (!canModifyQueue(message.member))
            // shaky
            throw new ActionUntakeableError(this.name, 'User must join the voice channel first');

        if (isNaN(num))
            throw new IllegalArgumentError(this.name, 'Field `Number` must be a valid integer');

        const song = queue.songs.splice(number - 1, 1);
        queue.textChannel.send(`${message.author} ❌ removed **${song[0].title}** from the queue.`);
    }
};