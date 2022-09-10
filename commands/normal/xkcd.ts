import {createSlashCommand} from '../../utils/commands';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IntegerRangeError from '../../errors/IntegerRangeError';


export const data = new SlashCommandBuilder()
    .setName('xkcd')
    .setDescription('Gets the specified xkcd comic, or one at random.')
    .addIntegerOption(option => option
        .setName('comic')
        .setDescription('The xkcd to send.'))

export default createSlashCommand<{comic?: number}>({
    data,
    async execute(message, parsed) {
        let num = parsed.comic;
        const max = (await (await fetch('https://xkcd.com/info.0.json')).json()).num;

        // If num is invalid
        if (typeof num === 'number' && (num < 1 || num > max))
            throw new IntegerRangeError(data.name, 'comic', 1, max);

        // If no number is specified, send a random comic
        if (!num) num = Math.ceil(Math.random() * max);

        const res = await (await fetch(`https://xkcd.com/${num}/info.0.json`)).json();
        const xkcdEmbed = success()
            .setTitle(`${res.safe_title} (${res.month}/${res.day}/${res.year})`)
            .setURL(`https://xkcd.com/${num}/`)
            .setDescription(res.alt)
            .setImage(res.img)
            .setFooter({text: `Comic #${num}, requested by ${author(message).tag}`});

        await replyEmbed(message, xkcdEmbed);
    }
});
