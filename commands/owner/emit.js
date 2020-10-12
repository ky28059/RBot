export default {
    name: 'emit',
    description: 'Emits an event to be detected by the client (for testing purposes).',
    usage: 'emit [event]',
    async execute(message, parsed, client) {
        if (!(message.author.id === client.ownerID)) return message.reply('you must be the bot owner to use this command!');

        const event = parsed.raw.shift().toLowerCase();

        switch (event) {
            case 'join':
                client.emit('guildMemberAdd', message.member);
                break;
            case 'leave':
                client.emit('guildMemberRemove', message.member);
                break;
            case 'delete':
                client.emit('messageDelete', message);
                break;
        }
        message.channel.send('Signal emitted!');
    }
}