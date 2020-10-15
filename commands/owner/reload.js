export default {
    name: 'reload',
    aliases: ['rl'],
    description: 'Reloads all command files.',
    usage: 'reload',
    async execute(message, parsed, client) {
        if (!(message.author.id === client.ownerID)) return message.reply('you must be the bot owner to use this command!');

        await client.loadCommands();
        message.channel.send('Commands reloaded!');
    }
}