import fetch from 'node-fetch';
import {Message, MessageEmbed, Util} from 'discord.js';
const {splitMessage} = Util;
import {pagedMessage} from '../../utils/messageUtils.js';


export default {
    name: 'fetch',
    aliases: ['grab'],
    description: 'Fetches plaintext HTML from a website link.',
    pattern: '[URL]',
    examples: 'fetch https://google.com',
    async execute(message: Message, parsed: {url: string}) {
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

        await pagedMessage(message, splitDescription.map(m => new MessageEmbed(fetchEmbed).setDescription(`\`\`\`html\n${m}\`\`\``)));
    }
}