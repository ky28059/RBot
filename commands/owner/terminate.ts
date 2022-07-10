import {createTextCommand} from '../../utils/parseCommands';
import {success} from '../../utils/messages';


export default createTextCommand({
    name: 'terminate',
    description: 'Terminates RBot.',
    ownerOnly: true,
    async execute(message) {
        await message.channel.send({embeds: [success().setDescription('Terminating...')]});

        // If not sharded, just kill the process like normal
        if (!message.client.shard) process.exit(1);

        // Tell the sharding manager to terminate
        await message.client.shard.send('terminate');
    }
});
