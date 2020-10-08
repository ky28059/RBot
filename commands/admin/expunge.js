export default {
  name: 'expunge',
  guildOnly: true,
  permReqs: 'MANAGE_MESSAGES',
  clientPermReqs: 'MANAGE_MESSAGES',
  async execute(message, parsed) {
    let expungeCount = Number(parsed.first);
    if (!expungeCount || expungeCount < 1 || expungeCount > 99) return message.reply("please provide a number between 1 and 99 for the number of messages to expunge reactions from");

    const fetched = await message.channel.messages.fetch({limit: expungeCount + 1});
    fetched.array().forEach(message =>
      message.reactions.cache.array().length > 0
        ? message.reactions.removeAll()
        : null
    );
    message.react('👌');
  }
}
