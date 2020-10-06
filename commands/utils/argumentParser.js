export function parseArgs(message, prefix, client) {
    const guild = message.guild;

    const args = message.content.slice(prefix.length).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
    const commandName = args.shift().toLowerCase();

    const snowflakes = args.filter(arg => Number(arg));

    const userTarget = message.mentions.users.first() || client.users.cache.get(snowflakes[0]) || client.users.cache.find(user => user.username === args[0]);
    const memberTarget = message.mentions.members.first() || guild.members.cache.get(snowflakes[0]) || guild.members.cache.find(member => member.user.username === args[0]);
    const channelTarget = message.mentions.channels.first() || client.channels.cache.get(snowflakes[0]);
    const roleTarget = message.mentions.roles.first() || guild.roles.cache.get(snowflakes[0]);

    let parsed = {};
    parsed.commandName = commandName;
    parsed.userTarget = userTarget;
    parsed.memberTarget = memberTarget;
    parsed.channelTarget = channelTarget;
    parsed.roleTarget = roleTarget;

    parsed.rawArgs = args;
    parsed.joined = args.join(' ');
    parsed.first = args[0];

    return parsed;
}