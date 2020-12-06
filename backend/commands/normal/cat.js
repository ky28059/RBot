export default {
    name: 'cat',
    description: 'Says a message concatenated from two arguments.',
    usage: 'cat [arg1] [arg2]',
    examples: 'cat Hello world!',
    execute(message, parsed) {
        const args = parsed.raw;
        if (!args) return message.reply('you must specify what to concat!');
        
        const first = args.shift();
        message.channel.send(`${first}${args}`, {allowedMentions: {parse: []}});
    }
}
