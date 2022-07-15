import {Client, ColorResolvable, EmbedFieldData, Guild, MessageEmbed, TextChannel} from 'discord.js';


type logOptions = {
    id?: string, color?: ColorResolvable,
    author?: string, authorIcon?: string | null,
    desc?: string,
    fields?: EmbedFieldData[]
};
export async function log(
    client: Client, guild: Guild, {id, color, author, authorIcon, desc, fields}: logOptions
) {
    // If there is no log channel specified by token
    if (!id) return;

    const channel = client.channels.cache.get(id);

    // If the log channel is invalid
    if (!channel)
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NONEXISTENT`);
    if (!channel.isText())
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NOT-TEXT`);

    const logEmbed = new MessageEmbed();

    if (color) logEmbed.setColor(color);
    if (author) logEmbed.setAuthor(author, authorIcon ?? undefined);
    if (desc) logEmbed.setDescription(desc);
    if (fields) logEmbed.addFields(fields);
    logEmbed.setFooter(new Date().toUTCString());

    channel.send({embeds: [logEmbed]})
        .catch(error => console.error(`Error while logging action in ${guild.name}: ${error}!`));
}
