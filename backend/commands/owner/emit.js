export default {
    name: 'emit',
    description: 'Emits an event to be detected by the client (for testing purposes).',
    usage: 'emit [event]',
    pattern: '[Event]',
    examples: 'emit leave',
    ownerOnly: true,
    async execute(message, parsed, client) {
        const event = parsed.event;

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