import {Command} from '../../types/Command';
import fetch from 'node-fetch';
import {MessageEmbed, Util} from 'discord.js';
import {pagedMessage} from '../../utils/messageUtils';


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
            .setFooter(`Requested by ${message.author.tag}`)

        const splitDescription = Util.splitMessage(source, {
            maxLength: 2048 - 12,
            char: '',
            prepend: '...',
            append: '...'
        });

        await pagedMessage(message, splitDescription.map(m => new MessageEmbed(fetchEmbed).setDescription(`\`\`\`html\n${m}\`\`\``)));
    }
} as Command;
