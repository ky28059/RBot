import {MessageEmbed} from 'discord.js';

export async function log(client, guild, channel, color, author, authorIcon, desc, fields) {
    // If there is no logchannel specified by token
    if (!channel) return;

    const logEmbed = new MessageEmbed();

    if (color) logEmbed.setColor(color);
    if (author) logEmbed.setAuthor(author, authorIcon);
    if (desc) logEmbed.setDescription(desc);
    if (fields) logEmbed.addFields(fields);
    logEmbed.setFooter(new Date());

    client.channels.cache.get(channel).send(logEmbed)
        .catch(error => console.error(`Error while logging action in ${guild}: ${error}!`));
}

