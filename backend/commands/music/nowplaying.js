import { MessageEmbed } from "discord.js";
import QueueNonexistentError from '../../errors/QueueNonexistentError.js';

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

        const playingEmbed = new MessageEmbed()
            .setTitle('Currently playing:')
            .setDescription(`${song.title}\n${song.url}`)
            .setColor('#F8AA2A');

        message.channel.send(playingEmbed);
    }
};