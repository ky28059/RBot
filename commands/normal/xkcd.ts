import {Message, CommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, reply, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IntegerRangeError from '../../errors/IntegerRangeError';


export default {
    data: new SlashCommandBuilder()
        .setName('xkcd')
        .setDescription('Gets the specified xkcd comic, or one at random.')
        .addIntegerOption(option => option
            .setName('comic')
            .setDescription('The xkcd to send.')),
    async execute(target: Message | CommandInteraction, parsed: {comic: number}) {
        let num = parsed.comic;
        const max = (await (await fetch('https://xkcd.com/info.0.json')).json()).num;

        // If num is invalid
        if (num < 1 || num > max)
            throw new IntegerRangeError('xkcd', 'comic', 1, max);

        // If no number is specified, send a random comic
        if (isNaN(num)) num = Math.ceil(Math.random() * max);

        const res = await (await fetch(`https://xkcd.com/${num}/info.0.json`)).json();
        const xkcdEmbed = success()
            .setTitle(`${res.safe_title} (${res.month}/${res.day}/${res.year})`)
            .setURL(`https://xkcd.com/${num}/`)
            .setDescription(res.alt)
            .setImage(res.img)
            .setFooter({text: `Comic #${num}, requested by ${author(target).tag}`});

        await replyEmbed(target, xkcdEmbed);
    }
}
