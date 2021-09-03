import fetch from 'node-fetch';
import {CommandInteraction, Message, MessageEmbed, Util} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {author, pagedMessage} from '../../utils/messageUtils';


export default {
    data: new SlashCommandBuilder()
        .setName('fetch')
        .setDescription('Fetches plaintext HTML from a website link.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to fetch')
                .setRequired(true)),
    async execute(target: Message | CommandInteraction, parsed: {url: string}) {
        const url = parsed.url;
        let source = await (await fetch(url)).text() || '[No Source Found]';

        const fetchEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Fetched:')
            .setFooter(`Requested by ${author(target).tag}`)

        const splitDescription = Util.splitMessage(source, {
            maxLength: 2048 - 12,
            char: '',
            prepend: '...',
            append: '...'
        });

        await pagedMessage(target, splitDescription.map(m => new MessageEmbed(fetchEmbed).setDescription(`\`\`\`html\n${m}\`\`\``)));
    }
}
