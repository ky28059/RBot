import fetch from 'node-fetch';
import {MessageEmbed, splitMessage} from 'discord.js';


export default {
    name: 'fetch',
    aliases: ['grab'],
    description: 'Fetches plaintext HTML from a website link. It is highly recommended to use this in a spam channel if you care about message history',
    pattern: '[URL]',
    examples: 'fetch https://google.com',
    async execute(message, parsed) {
        const url = parsed.url;
        let source = await (await fetch(url)).text() || '[No Source Found]';

        const fetchEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Fetched:')
            .setFooter(`Requested by ${message.author.tag}`)

        const splitDescription = splitMessage(source, {
            maxLength: 2048 - 12,
            char: '',
            prepend: '...',
            append: '...'
        });

        splitDescription.forEach(async (m) => {
            fetchEmbed.setDescription(`\`\`\`html\n${m}\`\`\``);
            message.channel.send(fetchEmbed);
        });
    }
}