import {Command} from '../../types/Command';
import {success} from '../../utils/messages';


export default {
    name: 'terminate',
    description: 'Terminates RBot.',
    examples: 'terminate',
    ownerOnly: true,
    async execute(message, parsed, client) {
        await message.channel.send(success({desc: 'Terminating...'}));

        // Tell the sharding manager to terminate
        await client.shard!.send('terminate');
    }
} as Command;
