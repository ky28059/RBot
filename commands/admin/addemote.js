export default {
  name: 'addemote',
  aliases: ['createemote'],
  guildOnly: true,
  permReqs: 'MANAGE_EMOJIS',
  clientPermReqs: 'MANAGE_EMOJIS',
  execute(message, parsed) {
    const guild = message.guild;
    let args = parsed.raw;
    const name = args.slice(1).join('_');
    guild.emojis.create(args[0], name)
        .then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
        .catch(error => message.channel.send(`Sorry ${message.author}, I couldn't create emoji because of : ${error}`));
  }
}

