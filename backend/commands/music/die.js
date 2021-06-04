import { canModifyQueue } from "../utils/canModifyQueue.ts";
import {die} from '../../utils/messages.ts';

import QueueNonexistentError from '../../errors/QueueNonexistentError.ts';


export default {
    name: 'die',
    aliases: ['leave', 'dc'],
    description: 'Kills the music.',
    examples: 'die',
    guildOnly: true,
    async execute(message) {
        const queue = message.client.queue.get(message.guild.id);

        if (!queue)
            throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member))
            return;

        queue.songs = [];
        queue.connection.dispatcher.end();
        queue.textChannel.send(die());

        await message.guild.me.voice.channel.leave();
    }
};