export default {
  name: 'addemote',
  aliases: ['createemote'],
  guildOnly: true,
  permReqs: 'MANAGE_EMOJIS',
  clientPermReqs: 'MANAGE_EMOJIS',
  execute(message, args) {
    const guild = message.guild;
    const name = args.slice(1).join('_');
    guild.emojis.create(args[0], name)
        .then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
        .catch(error => message.channel.send(`Sorry ${message.author}, I couldn't create emoji because of : ${error}`));
  }
}

