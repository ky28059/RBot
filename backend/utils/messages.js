import {MessageEmbed} from 'discord.js'


const errEmbed = new MessageEmbed()
    .setColor(0xb50300)
    .setFooter(new Date());

const successEmbed = new MessageEmbed()
    .setColor(0xf6b40c)


export function err(title, desc) {
    const embed = new MessageEmbed(errEmbed);

    if (desc)
        embed.setDescription(desc);
    if (title)
        embed.setAuthor(title, 'https://cdn.discordapp.com/avatars/684587440777986090/04d8e01393c7e0743c20fc87c351966d.webp');

    return embed;
}

export function success({title, desc}) {
    const embed = new MessageEmbed(successEmbed);

    if (desc)
        embed.setDescription(desc);
    if (title)
        embed.setAuthor(title);

    return embed;
}