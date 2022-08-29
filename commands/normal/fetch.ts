import {createSlashCommand} from '../../utils/commands';
import {EmbedBuilder} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, pagedMessage, splitMessage} from '../../utils/messageUtils';
import {requestedBy} from '../../utils/messages';


export const data = new SlashCommandBuilder()
    .setName('fetch')
    .setDescription('Fetches plaintext HTML from a website link.')
    .addStringOption(option => option
        .setName('url')
        .setDescription('The URL to fetch.')
        .setRequired(true))

export default createSlashCommand<{url: string}>({
    data,
    async execute(message, parsed) {
        const url = parsed.url;
        const source = await (await fetch(url)).text() || '[No Source Found]';

        const fetchEmbed = requestedBy(author(message))
            .setTitle('Fetched:');

        const splitDescription = splitMessage(source, {
            len: 2048 - 12,
            prepend: '...',
            append: '...'
        });

        await pagedMessage(
            message,
            splitDescription.map(m => EmbedBuilder.from(fetchEmbed).setDescription(`\`\`\`html\n${m}\`\`\``))
        );
    }
});
