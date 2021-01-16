export default {
    name: 'addemote',
    aliases: ['createemote'],
    description: 'Add an emote to this server.',
    usage: 'addemote [image link] [name]',
    pattern: '[Link] <Name>',
    examples: 'addemote https://example.com/image.png example',
    guildOnly: true,
    permReqs: 'MANAGE_EMOJIS',
    clientPermReqs: 'MANAGE_EMOJIS',
    execute(message, parsed) {
        const guild = message.guild;
        const link = parsed.link;
        const name = parsed.name.replace(/ /g, '_');

        guild.emojis.create(link, name)
            .then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
    }
}

