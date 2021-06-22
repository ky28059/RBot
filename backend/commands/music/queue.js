import { MessageEmbed, Util } from 'discord.js';
import {pagedMessage} from '../../utils/messageUtils.ts';
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    name: 'queue',
    aliases: ['q'],
    description: 'Displays the current music queue.',
    examples: 'queue',
    guildOnly: true,
    async execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            throw new QueueNonexistentError(this.name);

        const description = queue.songs.map((song, index) => `${index + 1}) ${Util.escapeMarkdown(song.title)} : ${song.duration}`);

        let queueEmbed = new MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(description)
            .setColor('#F8AA2A');

        const splitDescription = Util.splitMessage(`\`\`\`elm\n${description.join('\n')}\n\`\`\``, {
            maxLength: 2048,
            char: '\n',
            prepend: '```elm\n',
            append: '```'
        });

        await pagedMessage(message, splitDescription.map(m => new MessageEmbed(queueEmbed).setDescription(m)));
    }
};