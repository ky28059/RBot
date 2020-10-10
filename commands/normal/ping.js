export default {
    name: 'ping',
    description: 'Gets latency.',
    usage: 'ping',
    async execute(message, parsed, client) {
        let m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    }
}
