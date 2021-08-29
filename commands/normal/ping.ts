import {Message} from 'discord.js';

export default {
    name: 'ping',
    description: 'Gets latency.',
    examples: 'ping',
    async execute(message: Message) {
        let m = await message.channel.send('Ping?');
        await m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ws.ping)}ms`);
    }
}
