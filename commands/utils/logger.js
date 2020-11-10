import {MessageEmbed} from "discord.js";

export async function log(client, guild, color, author, authorIcon, desc, fields) {
    const tag = await client.Tags.findOne({ where: { guildID: guild.id } });
    if (!tag.logchannel) return;

    const logEmbed = new MessageEmbed();
    if (color) logEmbed.setColor(color);
    if (author && authorIcon) {
        logEmbed.setAuthor(author, authorIcon);
    } else if (author) {
        logEmbed.setAuthor(author);
    }
    if (desc) logEmbed.setDescription(desc);
    if (fields) logEmbed.addFields(fields);
    logEmbed.setFooter(`${new Date()}`);

    client.channels.cache.get(tag.logchannel).send(logEmbed)
        .catch(error => console.error(`Error while logging action in ${guild}: ${error}!`));
}

