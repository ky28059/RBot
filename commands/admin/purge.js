export default {
  name: 'purge',
  guildOnly: true,
  permReqs: 'MANAGE_MESSAGES',
  clientPermReqs: 'MANAGE_MESSAGES',
  async execute(message, args) {
    const deleteCount = args[0];
    if (!deleteCount || deleteCount < 2 || deleteCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to delete");

    const fetched = await message.channel.messages.fetch({limit: deleteCount});
    message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`couldn't delete messages because of: ${error}`));
  }
}
