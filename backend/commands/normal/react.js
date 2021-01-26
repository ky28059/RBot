export default {
    name: 'react',
    description: 'Reacts to the previous message with the specified emoji(s). Supports ascii emoji and custom emoji id.',
    pattern: '[...Emojis]',
    examples: ['react 👌', 'react 👌 🤣', 'react 711636407499882559', 'react 711636407499882559 762740017432887356'],
    clientPermReqs: 'ADD_REACTIONS',
    async execute(message, parsed) {
        message.channel.messages.fetch({limit: 2}).then(messages => {
            let target = messages.last();
            parsed.emojis.forEach(id => {
                target.react(id)
                    .catch(error => message.reply(`reaction could not be added because of ${error}`));
            });
            messages.first().delete().catch(error => console.log(error));
        });
    }
}
