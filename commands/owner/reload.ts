import {Message} from 'discord.js';
import {err, success} from '../../utils/messages';


export default {
    name: 'reload',
    aliases: ['rl'],
    description: 'Reloads all command files.',
    examples: 'reload',
    ownerOnly: true,
    async execute(message: Message) {
        // Return early if running without sharding
        if (!message.client.shard)
            return message.channel.send({embeds: [
                err('UNSHARDED', 'Bot currently running in unsharded mode; cannot reload commands')]});

        await message.channel.send({embeds: [success().setDescription('Reloading commands...')]});

        // Kill all shards, causing them to be respawned by the manager
        // On spawn, they will reload their commands with the updated versions
        // Most likely an unideal implementation but at least it works
        await message.client.shard.broadcastEval(() => process.exit(1));
    }
}
