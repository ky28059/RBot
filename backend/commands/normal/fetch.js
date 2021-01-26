import fetch from 'node-fetch';
import {MessageEmbed} from 'discord.js';
import {truncateMessage} from '../utils/messageTruncator.js';


export default {
    name: 'fetch',
    aliases: ['grab'],
    description: 'Fetches plaintext HTML from a website link.',
    pattern: '[URL]',
    examples: 'fetch https://google.com',
    async execute(message, parsed) {
        const url = parsed.url;
        let source = await (await fetch(url)).text() || '[No Source Found]';

        const fetchEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Fetched:')
            .setDescription(`\`\`\`html\n${truncateMessage(source, -37)}\`\`\``)
            .setFooter(`Requested by ${message.author.tag}`)

        message.channel.send(fetchEmbed);
    }
}