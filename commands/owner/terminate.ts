import {Message} from 'discord.js';
import {success} from '../../utils/messages';


export default {
    name: 'terminate',
    description: 'Terminates RBot.',
    examples: 'terminate',
    ownerOnly: true,
    async execute(message: Message) {
        await message.channel.send({embeds: [success({desc: 'Terminating...'})]});

        // If not sharded, just kill the process like normal
        if (!message.client.shard) process.exit(1);

        // Tell the sharding manager to terminate
        await message.client.shard.send('terminate');
    }
}
