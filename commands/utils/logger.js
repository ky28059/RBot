const {MessageEmbed} = require("discord.js");
const {readToken} = require("./tokenManager.js");

module.exports = async function log(client, guild, color, author, authorIcon, desc, fields) {
    const tokenData = await readToken(guild);

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

    client.channels.cache.get(tokenData.logchannel).send(logEmbed).catch(error => console.error(`Error while logging action in ${guild}: ${error}!`));
}

