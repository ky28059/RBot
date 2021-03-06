export default {
    name: 'choose',
    description: 'Chooses at random between several options.',
    pattern: '[...Options]',
    examples: ['choose red blue', 'choose "hip hop" classical'],
    execute(message, parsed) {
        const options = parsed.options;
        const index = Math.floor(Math.random() * options.length);
        message.channel.send(options[index], {allowedMentions: {parse: []}});
    }
}
