export function addemote(message, link, name) {
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('MANAGE_EMOJIS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

  guild.emojis.create(link, name)
    .then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
    .catch(error => message.channel.send(`Sorry ${message.author}, I couldn't create emoji because of : ${error}`));
}

//export {addemote};
