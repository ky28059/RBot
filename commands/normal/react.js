export default {
    name: 'react',
    description: 'Reacts to the previous message with the specified emoji(s).',
    usage: 'react [emoji / emoji-id]',
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
