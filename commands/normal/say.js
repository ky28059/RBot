export default {
  name: 'say',
  execute(message, args) {
    const content = args.join(' ');
    if (!content) return message.reply('you must specify what to say!');

    message.channel.send(content);
  }
}
