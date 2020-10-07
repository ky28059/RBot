export default {
  name: 'react',
  clientPermReqs: 'ADD_REACTIONS',
  async execute(message, parsed) {
    message.channel.messages.fetch({limit: 2}).then(messages => {
      let target = messages.last();
      parsed.raw.forEach(id => {
        target.react(id)
            .catch(error => message.reply(`reaction could not be added because of ${error}`));
      });
      messages.first().delete().catch(error => console.log(error));
    });
  }
}
