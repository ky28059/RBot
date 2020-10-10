export default {
    name: 'say',
    description: 'Repeats your message.',
    usage: 'say [content]',
    execute(message, parsed) {
        const content = parsed.joined;
        if (!content) return message.reply('you must specify what to say!');

        message.channel.send(content);
    }
}
