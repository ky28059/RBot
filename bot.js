import Discord, {MessageEmbed} from 'discord.js';
import fs from 'fs';
import {token} from './auth.js';
import {readToken} from './commands/utils/tokenManager.js';
import {log} from "./commands/utils/logger.js";
import {update} from "./commands/utils/update.js";
import {parseArgs} from './commands/utils/argumentParser.js';
import {truncateMessage} from './commands/utils/messageTruncator.js';

const client = new Discord.Client();

// Dynamic command handling
client.commands = new Discord.Collection();

client.loadCommands = async function() {
    const dirnames = ['admin', 'music', 'normal', 'owner', 'token'];

    for (let dir of dirnames) {
        const commands = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

        for (let file of commands) {
            let command = await import(`./commands/${dir}/${file}`);
            command = command.default; // Required because of default exports
            command.commandGroup = dir; // Dynamic commandgroups
            client.commands.set(command.name, command);
        }
    }
    console.log('Commands loaded!');
}

client.ownerID = '355534246439419904'; // For owner only commands
client.queue = new Map(); // For music commands
const talkedRecently = new Set(); // For global cooldowns; consider switching to command specific cooldowns?

// Initialize Discord Bot
client.once('ready', async () => {
    await client.loadCommands();
    console.log(`Logged in as ${client.user.tag}!`);
    await client.user.setActivity('!help', {type: "LISTENING"});
});

client.on("guildCreate", async guild => {
    await update(guild);
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
    if (message.author.bot) return; // Bot ignores itself and other bots

    if (message.channel.type === 'dm') { // DM forwarding
        const dmEmbed = new MessageEmbed()
            .setColor(0x7f0000)
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setDescription(`**${message.author} DMed RBot this message:**\n${message.content}`)
            .setFooter(`${new Date()}`);
        await client.users.cache.get(client.ownerID).send(dmEmbed);
        // Much of the bot relies on the token infrastructure of readToken and guilds
        // TODO: wrap many things in if statements so that dms still have limited command capacity
        return;
    }

    if (talkedRecently.has(message.author.id)) return; // Spam prevention

    // maybe move this code elsewhere? idk
    const guild = message.guild;
    const member = guild.member(message.author);

    await update(guild); // Does !update upon each message, because screw you unupdated token issues!
    const tokenData = await readToken(guild);
    const prefix = tokenData.prefix || '!'; // maybe move somewhere else?

    // Handles censorship
    if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id) && !member.hasPermission('ADMINISTRATOR')) {
        await message.delete()
            .catch(error => console.error(`message in ${guild} could not be censored because of ${error}!`));

        await log(client, guild, 0x7f0000, message.author.tag, message.author.avatarURL(), `**Message by ${message.author} censored in ${message.channel}:**\n${message.content}`)
        return;
    }

    if (message.content.substring(0, prefix.length) === prefix) {
        const parsed = parseArgs(message, prefix, client);

        const commandName = parsed.commandName;
        if (tokenData.disabledcommands && tokenData.disabledcommands.includes(commandName)) return; //command disabling

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type === 'dm') return message.reply('I can\'t execute that command inside DMs!');
        if (command.permReqs && !member.hasPermission(command.permReqs)) return message.reply(`you do not have sufficient perms to do that! Perms required for this command: ${command.permReqs}`);
        if (command.clientPermReqs && !guild.member(client.user).hasPermission(command.clientPermReqs)) return message.reply(`I do not have sufficient perms to do that! Perms I need for this command: ${command.clientPermReqs}`);

        try {
            await command.execute(message, parsed, client);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }

        // adds user to set if they have used a command recently
        talkedRecently.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after 1 second
            talkedRecently.delete(message.author.id);
        }, 1000);
    }
});

// Bot logs the following events:

client.on("messageDelete", async message => {
    if (!message.guild) return; // Ignores DMs
    if (message.author.bot) return; // Bot ignores itself and other bots

    const guild = message.guild;
    const tokenData = await readToken(guild);
    if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id)) return; // prevents double logging of censored messages, probably better way of doing this
    if (!(tokenData.logchannel && tokenData.logmessagedelete)) return;

    let desc = truncateMessage(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content}`, -48) // Unlike messages, embed descriptions have a character limit of 2048
    await log(client, guild, 0xb50300, message.author.tag, message.author.avatarURL(), desc);
});

client.on("messageDeleteBulk", async messages => {
    const guild = messages.first().guild;
    const tokenData = await readToken(guild);
    if (!(tokenData.logchannel && tokenData.logmessagedeletebulk)) return;

    // temporary Dyno-like bulkdelete logging system, will convert into superior system later
    await log(client, guild, 0xb50300, guild.name, guild.iconURL(), `**${messages.array().length} messages were deleted in ${messages.first().channel}**`);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (!oldMessage.guild) return; // Ignores DMs
    if (oldMessage.author.bot) return; // Bot ignores itself and other bots
    if (oldMessage.content === newMessage.content) return; // fixes weird link preview glitch

    const guild = oldMessage.guild;
    const tokenData = await readToken(guild);
    if (!(tokenData.logchannel && tokenData.logmessageedit)) return;

    let desc = `**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`;
    let truncatedBefore = truncateMessage(oldMessage.content, 976); // Unlike messages, embed fields have a character limit of 1024
    let truncatedAfter = truncateMessage(newMessage.content, 976);
    let fields = [{name: 'Before:', value: truncatedBefore}, {name: 'After:', value: truncatedAfter}];

    await log(client, guild, 0xed7501, oldMessage.author.tag, oldMessage.author.avatarURL(), desc, fields);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => { // TODO: finish this by adding role logging
    if (oldMember.user.bot) return;

    const guild = oldMember.guild;
    const tokenData = await readToken(guild);
    if (!(tokenData.logchannel && tokenData.lognicknamechange)) return; // will have to update later if I wish to use this for more things than nickname changes

    // not sure how compatible this is with new log function
    const updateEmbed = new MessageEmbed()
        .setColor(0xf6b40c)
        .setAuthor(newMember.user.tag, newMember.user.avatarURL())
        .setFooter(`${new Date()}`);

    if (oldMember.nickname !== newMember.nickname) {
        updateEmbed
            .setDescription(`**${newMember.user} changed their nickname:**`)
            .addFields(
                {name: 'Before:', value: oldMember.nickname || 'None'},
                {name: 'After:', value: newMember.nickname || 'None'}
            );
        client.channels.cache.get(tokenData.logchannel).send(updateEmbed).catch(error => console.error(`guildMemberUpdate in ${guild} could not be logged because of ${error}!`));
    }
});

client.on("guildMemberAdd", async (member) => {
    const guild = member.guild;
    const tokenData = await readToken(guild);

    if (tokenData.blacklist.includes(member.id)) { // Enforces blacklist
        await member.ban('Blacklisted user');
        await log(client, guild, 0x7f0000, member.user.tag, member.user.avatarURL(), `**User ${member.user} has been banned on join (blacklist)**`);
        return;
    }

    if (tokenData.autoroles) { // Adds autoroles
        const autoroles = tokenData.autoroles.trim().split(' ');
        await member.edit({roles: member.roles.cache.array().concat(autoroles)});
    }
    if (!(tokenData.logchannel && tokenData.logmemberjoin)) return;

    await log(client, guild, 0x79ff3b, 'Member joined the server', member.user.avatarURL(), `${member.user} ${member.user.tag}`);
    // add potential welcome messages later
});

client.on("guildMemberRemove", async (member) => {
    const guild = member.guild;
    const tokenData = await readToken(guild);
    if (!(guild.systemChannel && tokenData.logmemberleave)) return;

    const leaveEmbed = new MessageEmbed()
        .setColor(0x333333)
        .setAuthor('Member left the server', member.user.avatarURL())
        .setDescription(`${member.user} ${member.user.tag}`)
        .setFooter(`${new Date()}`);

    guild.systemChannel.send(leaveEmbed).catch(error => console.error(`guildMemberRemove in ${guild} could not be logged because of ${error}!`));
});

// Error handling
client.on("warn", info => console.log(info));
client.on("error", error => console.error(error));

client.login(token);
