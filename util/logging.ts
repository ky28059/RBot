import {Client, ColorResolvable, Guild, EmbedBuilder, APIEmbedField} from 'discord.js';


type logOptions = {
    id?: string, color?: ColorResolvable,
    author?: string, authorIcon?: string | null,
    desc?: string,
    fields?: APIEmbedField[]
};

/**
 * Logs an event to a guild's log channel.
 * @param client - The instantiating `Client`.
 * @param guild - The `Guild` to log to.
 * @param id - The snowflake id of the guild's log channel.
 * @param color - The color of the log embed.
 * @param author - The author of the log embed.
 * @param authorIcon - The author icon of the log embed.
 * @param desc - The description of the log embed.
 * @param fields - The fields of the log embed.
 */
export async function log(
    client: Client, guild: Guild, {id, color, author, authorIcon, desc, fields}: logOptions
) {
    // If there is no log channel specified by token
    if (!id) return;

    const channel = client.channels.cache.get(id);

    // If the log channel is invalid
    if (!channel)
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NONEXISTENT`);
    if (!channel.isTextBased())
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NOT-TEXT`);

    const logEmbed = new EmbedBuilder();

    if (color) logEmbed.setColor(color);
    if (author) logEmbed.setAuthor({name: author, iconURL: authorIcon ?? undefined});
    if (desc) logEmbed.setDescription(desc);
    if (fields) logEmbed.addFields(fields);
    logEmbed.setFooter({text: new Date().toUTCString()});

    channel.send({embeds: [logEmbed]})
        .catch(error => console.error(`Error while logging action in ${guild.name}: ${error}!`));
}
