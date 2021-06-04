import {nowPlaying} from '../../utils/messages.ts';
import QueueNonexistentError from '../../errors/QueueNonexistentError.ts';


export default {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Displays the currently playing song.',
    examples: 'nowplaying',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            throw new QueueNonexistentError(this.name);

        const song = queue.songs[0];
        message.channel.send(nowPlaying(song));
    }
};
