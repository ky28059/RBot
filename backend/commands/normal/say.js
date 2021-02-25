export default {
    name: 'say',
    description: 'Repeats your message.',
    pattern: '<Message>',
    examples: 'say Hello world!',
    execute(message, parsed) {
        message.channel.send(parsed.message, {allowedMentions: {parse: []}});
    }
}
