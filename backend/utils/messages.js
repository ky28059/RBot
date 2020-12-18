import {MessageEmbed} from 'discord.js'


const errEmbed = new MessageEmbed()
    .setColor(0xb50300)
    .setFooter(new Date());

export function err(title, desc) {
    return errEmbed
        .setAuthor(title, 'https://cdn.discordapp.com/avatars/684587440777986090/04d8e01393c7e0743c20fc87c351966d.webp')
        .setDescription(desc);
}