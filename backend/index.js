import { ShardingManager } from 'discord.js';
import { token } from './auth.js';


const manager = new ShardingManager(
    './bot.js',
    {
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
