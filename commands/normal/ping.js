export default {
  name: 'ping',
  async execute(message, args, userTarget, memberTarget, channelTarget, roleTarget, client) {
    let m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }
}
