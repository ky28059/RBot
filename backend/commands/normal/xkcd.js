import fetch from 'node-fetch';
import {MessageEmbed} from "discord.js";

export default {
    name: 'xkcd',
    description: 'Gets the specified xkcd comic, or one at random.',
    pattern: '[Number]?',
    examples: ['xkcd', 'xkcd 273'],
    async execute(message, parsed) {
        let num = parsed.number;

        // If no number is specified, send a random comic
        if (isNaN(num)) {
            const max = (await (await fetch('https://xkcd.com/info.0.json')).json()).num;
            num = Math.ceil(Math.random() * max);
        }

        const res = await (await fetch(`https://xkcd.com/${num}/info.0.json`)).json();
        const xkcdEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(`${res.safe_title} (${res.month}/${res.day}/${res.year})`)
            .setURL(`https://xkcd.com/${num}/`)
            .setDescription(res.alt)
            .setImage(res.img)
            .setFooter(`Comic #${num}, requested by ${message.author.tag}`);

        message.channel.send(xkcdEmbed);
    }
}
