import {createTextCommand} from '../../utils/parseCommands';


export default createTextCommand<{event: string}, true>({
    name: 'emit',
    description: 'Emits an event to be detected by the client (for testing purposes).',
    pattern: '[event]',
    examples: 'emit leave',
    guildOnly: true,
    ownerOnly: true,
    async execute(message, parsed) {
        const event = parsed.event;
        const client = message.client;

        switch (event) {
            case 'join': client.emit('guildMemberAdd', message.member!); break;
            case 'leave': client.emit('guildMemberRemove', message.member!); break;
            case 'delete': client.emit('messageDelete', message); break;
        }

        message.channel.send('Signal emitted!');
    }
});
