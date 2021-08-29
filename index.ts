import { ShardingManager } from 'discord.js';
import { token } from './auth.js';


const manager = new ShardingManager('./bot.ts', {
    // Persist flags downwards
    shardArgs: process.argv.slice(2),
    token: token
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn().then(() => {
    for (const [id, shard] of manager.shards) {
        shard.on('message', message => {
            if (message === 'terminate') process.exit(1);
        })
    }
});
