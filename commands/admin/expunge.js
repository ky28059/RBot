export default {
  name: 'expunge',
  guildOnly: true,
  permReqs: 'MANAGE_MESSAGES',
  async execute(message, args) {
    // TODO: make this not super slow
    const expungeCount = args[0];
    if (!expungeCount || expungeCount < 2 || expungeCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to expunge reactions from");

    const fetched = await message.channel.messages.fetch({limit: expungeCount});
    fetched.array().forEach(message => message.reactions.removeAll());
    message.react('👌');
  }
}
