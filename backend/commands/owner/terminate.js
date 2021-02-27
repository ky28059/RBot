import {success} from '../../utils/messages.js';


export default {
    name: 'terminate',
    description: 'Terminates RBot.',
    examples: 'terminate',
    ownerOnly: true,
    async execute(message, parsed, client) {
        message.channel.send(success({desc: 'Terminating...'}));

        // Tell the sharding manager to terminate
        await client.shard.send('terminate');
    }
}
