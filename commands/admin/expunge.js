export async function expunge(message, guild, expungeCount) {
  // TODO: make this not super slow
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe require different perms?

  if (!expungeCount || expungeCount < 2 || expungeCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to expunge reactions from");

  const fetched = await message.channel.messages.fetch({limit: expungeCount});
  fetched.array().forEach(message => message.reactions.removeAll());
  message.react('👌');
}

//export {expunge};
