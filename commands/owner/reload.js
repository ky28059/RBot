export default {
    name: 'reload',
    aliases: ['rl'],
    description: 'Reloads all command files.',
    usage: 'reload',
    examples: 'reload',
    async execute(message, parsed, client) {
        // TODO: find out how to clear the import() cache so that this is not broken
        if (!(message.author.id === client.ownerID)) return message.reply('you must be the bot owner to use this command!');

        await client.loadCommands();
        message.channel.send('Commands reloaded!');
    }
}