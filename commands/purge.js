async function purge(message, guild, deleteCount) {
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

  if (!deleteCount || deleteCount < 2 || deleteCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to delete");

  const fetched = await message.channel.messages.fetch({limit: deleteCount});
  message.channel.bulkDelete(fetched)
    .catch(error => message.reply(`couldn't delete messages because of: ${error}`));
}

export default purge;
