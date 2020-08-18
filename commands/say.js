function say(message, content) {
  // feels like a waste of a file
  if (!content) return message.reply('you must specify what to say!');

  message.channel.send(content);
}

export default say;
