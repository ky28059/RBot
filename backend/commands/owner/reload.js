import {success} from '../../utils/messages.js';


export default {
    name: 'reload',
    aliases: ['rl'],
    description: 'Reloads all command files.',
    examples: 'reload',
    ownerOnly: true,
    async execute(message, parsed, client) {
        message.channel.send(success({desc: 'Reloading commands...'}));

        // Kill all shards, causing them to be respawned by the manager
        // On spawn, they will reload their commands with the updated versions
        // Most likely an unideal implementation but at least it works
        await client.shard.broadcastEval('process.exit(1)');
    }
}
