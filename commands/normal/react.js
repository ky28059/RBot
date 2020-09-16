export default {
  name: 'react',
  async execute(message, args) {
    message.channel.messages.fetch({limit: 2}).then(messages => {
      let target = messages.last();
      args.forEach(id => {
        target.react(id)
            .catch(error => message.reply(`reaction could not be added because of ${error}`));
      });
      messages.first().delete().catch(error => console.log(error));
    });
  }
}
