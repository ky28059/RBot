export default {
  name: 'say',
  execute(message, parsed) {
    const content = parsed.joined;
    if (!content) return message.reply('you must specify what to say!');

    message.channel.send(content);
  }
}
