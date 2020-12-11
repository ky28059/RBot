export function parseArgs(message, prefix, client) {
    const guild = message.guild;
    let parsed = {};

    const args = message.content.slice(prefix.length).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
    parsed.commandName = args.shift().toLowerCase();

    const snowflakes = args.filter(arg => isSnowflake(arg));

    // Mentions
    parsed.userTarget = message.mentions.users.first() || client.users.cache.get(snowflakes[0]) || client.users.cache.find(user => user.username === args[0]);
    parsed.channelTarget = message.mentions.channels.first() || client.channels.cache.get(snowflakes[0]);

    if (guild) {
        // GuildMembers and Roles don't exist in DMs
        parsed.memberTarget = message.mentions.members.first() || guild.members.cache.get(snowflakes[0]) || guild.members.cache.find(member => member.user.username === args[0]);
        parsed.roleTarget = message.mentions.roles.first() || guild.roles.cache.get(snowflakes[0]);
    }

    // Common permutations of args
    parsed.raw = args;
    parsed.joined = args.join(' ');
    parsed.first = args[0];

    return parsed;
}

const isSnowflake = (arg) => arg.length === 18 && Number(arg)