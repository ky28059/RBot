import {EmbedFieldData, Guild, MessageEmbed, TextChannel} from 'discord.js';
import RBot from '../../types/RBot';


type logOptions = {
    id?: string, color?: string,
    author?: string, authorIcon?: string | null,
    desc?: string,
    fields?: EmbedFieldData[]
};
export async function log(
    client: RBot, guild: Guild, {id, color, author, authorIcon, desc, fields}: logOptions
) {
    // If there is no log channel specified by token
    if (!id) return;

    const channel = client.channels.cache.get(id);

    // If the log channel is invalid
    if (!channel)
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NONEXISTENT`);
    if (channel.type !== 'text')
        return console.warn(`Invalid logchannel ${id} in ${guild.name} with reason: NOT-TEXT`);

    const logEmbed = new MessageEmbed();

    if (color) logEmbed.setColor(color);
    if (author) logEmbed.setAuthor(author, authorIcon ?? undefined);
    if (desc) logEmbed.setDescription(desc);
    if (fields) logEmbed.addFields(fields);
    logEmbed.setFooter(new Date());

    (channel as TextChannel).send(logEmbed)
        .catch(error => console.error(`Error while logging action in ${guild.name}: ${error}!`));
}
