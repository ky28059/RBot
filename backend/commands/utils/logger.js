import {MessageEmbed} from "discord.js";

export async function log(client, guild, tag, color, author, authorIcon, desc, fields) {
    // If there is no logchannel specified by token
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
    logEmbed.setFooter(new Date());

    client.channels.cache.get(tag.logchannel).send(logEmbed)
        .catch(error => console.error(`Error while logging action in ${guild}: ${error}!`));
}

