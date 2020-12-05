import { ShardingManager } from 'discord.js';
import { token } from './auth.js';
const manager = new ShardingManager('./bot.js', { token: token });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();