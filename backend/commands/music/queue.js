import { MessageEmbed, splitMessage, escapeMarkdown } from "discord.js";
import QueueNonexistentError from '../../errors/QueueNonexistentError.js';


export default {
    name: 'queue',
    aliases: ['q'],
    description: 'Displays the current music queue.',
    examples: 'queue',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            throw new QueueNonexistentError(this.name);

        const description = queue.songs.map((song, index) => `${index + 1}. ${escapeMarkdown(song.title)}`);

        let queueEmbed = new MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(description)
            .setColor('#F8AA2A');

        const splitDescription = splitMessage(description, {
            maxLength: 2048,
            char: '\n',
            prepend: '',
            append: ''
        });

        splitDescription.forEach(async (m) => {
            queueEmbed.setDescription(m);
            message.channel.send(queueEmbed);
        });
    }
};