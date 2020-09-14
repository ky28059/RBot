export async function react(message, reactions) {
  message.channel.messages.fetch({limit: 2}).then(messages => {
    let target = messages.last();
    reactions.forEach(id => {
      target.react(id)
        .catch(error => message.reply(`reaction could not be added because of ${error}`));
    });
    messages.first().delete();
  });
}
