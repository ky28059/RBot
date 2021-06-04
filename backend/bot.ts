// Libraries
import {Guild, MessageEmbed, PermissionResolvable, TextChannel} from 'discord.js';
import {Sequelize} from 'sequelize';
import fs from 'fs';

// Auth
import {token} from './auth';

// Utils
import {log} from './commands/utils/logger';
import parse from './utils/argumentParser';
import {update, isInField, containsField} from './utils/tokenManager';
import {truncateMessage} from './commands/utils/messageTruncator';

// Messages
import {err} from './utils/messages';
import CommandError from './errors/CommandError';

// Models
import loadGuilds, {GuildInstance} from './models/Guild.js';

// Types
import RBot from './types/RBot';
import {Command} from './types/Command';


const client = new RBot({
    ws: {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_EMOJIS",
            "GUILD_VOICE_STATES",
            "GUILD_MESSAGE_REACTIONS",
            "DIRECT_MESSAGES"
        ]
    }
});

// Models
const database = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
client.GuildTags = loadGuilds(database);


// Keeping definition here for fs pathing
client.loadCommands = async function() {
    const dirnames = ['admin', 'music', 'normal', 'owner', 'presets'];

    for (let dir of dirnames) {
        const commands = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

        for (let file of commands) {
            const imported = await import(`./commands/${dir}/${file}`);
            const command = imported.default as Command; // Required because of default exports
            command.commandGroup = dir; // Dynamic commandgroups
            client.commands.set(command.name, command);
        }
    }
    console.log('Commands loaded!');
}


const talkedRecently = new Set(); // For global cooldowns; consider switching to command specific cooldowns?


// Run initial stuff
client.once('ready', async () => {
    await client.loadCommands(); // Load commands
    await client.GuildTags.sync(); // Sync database
    console.log(`Logged in as ${client.user!.tag}!`);
    await client.user!.setActivity('!help', {type: "LISTENING"});
});

client.on('guildCreate', async guild => {
    await update(guild, client);
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
    if (message.author.bot) return; // Bot ignores itself and other bots

    if (message.channel.type === 'dm') { // DM forwarding
        const dmEmbed = new MessageEmbed()
            .setColor(0x7f0000)
            .setAuthor(message.author.tag, message.author.avatarURL() ?? undefined)
            .setDescription(`**${message.author} DMed RBot this message:**\n${message.content}`)
            .setFooter(`${new Date()}`);
        await client.users.cache.get(client.ownerID)!.send(dmEmbed);
    }

    if (talkedRecently.has(message.author.id)) return; // Global spam prevention

    let prefix = '!';
    let tag: GuildInstance | null = null;
    let member;
    let guild = message.guild;

    // Server specific Tag reliant things (censorship, custom prefix)
    if (guild) {
        member = guild.member(message.author)!;

        await update(guild, client);
        tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;
        prefix = tag.prefix;

        // Handle censorship
        if (
            (tag.censored_users && isInField(tag, 'censored_users', message.author.id)
            || (tag.censored_words && containsField(tag, 'censored_words', message.content, 'ҩ')))
            && !member.hasPermission('ADMINISTRATOR') // Admin override
        ) {
            await message.delete({reason: 'CENSORSHIP :: PASSED CRITERION'})
                .catch(error => console.error(`message in ${guild} could not be censored because of ${error}!`));

            await log(client, guild, {
                id: tag.logchannel, color: '0x7f0000', author: message.author.tag, authorIcon: message.author.avatarURL(),
                desc: `**Message by ${message.author} censored in ${message.channel}:**\n${message.content}`
            });
            return;
        }
    }

    if (message.content.substring(0, prefix.length) === prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        if (message.guild
            && tag!.disabled_commands
            && isInField(tag, 'disabled_commands', commandName)
        ) return message.reply(err('DISABLED_ERROR', 'Invoked command disabled in current server')); // Handles command disabling

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => !!cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // List of conditions to check before executing command
        if (command.guildOnly && message.channel.type === 'dm')
            return message.reply(err('DM_ERROR', 'Guild only command cannot be executed inside DMs'));
        if (command.permReqs && !member?.hasPermission(command.permReqs as PermissionResolvable))
            return message.reply(err('USER_PERMS_MISSING', `User lacks permissions: \`${command.permReqs}\``));
        if (command.clientPermReqs && !guild?.me?.hasPermission(command.clientPermReqs as PermissionResolvable))
            return message.reply(err('CLIENT_PERMS_MISSING', `Client lacks permissions: \`${command.clientPermReqs}\``));
        if (command.ownerOnly && message.author.id !== client.ownerID)
            return message.reply(err('OWNER_ONLY', 'Owner only command cannot be invoked by non owner'));

        try {
            const parsed = parse(args.join(' '), command, client, guild); // ArgString needs to be the raw string content
            await command.execute(message, parsed, client, tag);
        } catch (e) {
            // If the error was a result of bad code, log it
            if (!(e instanceof CommandError)) {
                console.error(`Error in command ${commandName} called in ${guild?.name ?? 'a DM'} at ${new Date()}: ${e}`);
            }
            await message.reply(err(e.name, e.message));
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

client.on('messageDelete', async message => {
    if (!message.guild) return; // Ignores DMs
    if (message.author!.bot) return; // Bot ignores itself and other bots

    const guild = message.guild;
    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;

    if (tag.censored_users && isInField(tag, 'censored_users', message.author!.id)) return; // prevents double logging of censored messages, probably better way of doing this
    if (!(tag.logchannel && tag.log_message_delete)) return;

    let desc = truncateMessage(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content}`, -48) // Unlike messages, embed descriptions have a character limit of 2048
    await log(client, guild, {
        id: tag.logchannel, color: '0xb50300', author: message.author!.tag, authorIcon: message.author!.avatarURL(),
        desc: desc
    });
});

client.on('messageDeleteBulk', async messages => {
    const first = messages.first()!;
    const guild = first.guild;
    if (!guild) return;

    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_message_delete_bulk)) return;

    // Log event
    // temporary Dyno-like bulkdelete logging system, will convert into superior system later
    await log(client, guild, {
        id: tag.logchannel, color: '0xb50300', author: guild.name, authorIcon: guild.iconURL(),
        desc: `**${messages.array().length} messages were deleted in ${first.channel}**`
    });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!oldMessage.guild) return; // Ignores DMs
    if (oldMessage.author!.bot) return; // Bot ignores itself and other bots
    if (oldMessage.content === newMessage.content) return; // Fixes weird link preview glitch

    const guild = oldMessage.guild;
    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_message_edit)) return;

    let desc = `**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`;
    let truncatedBefore = truncateMessage(oldMessage.content, 976); // Unlike messages, embed fields have a character limit of 1024
    let truncatedAfter = truncateMessage(newMessage.content, 976);
    let fields = [{name: 'Before:', value: truncatedBefore}, {name: 'After:', value: truncatedAfter}];

    // Log event
    await log(client, guild, {
        id: tag.logchannel, color: '0xed7501', author: oldMessage.author!.tag, authorIcon: oldMessage.author!.avatarURL(),
        desc: desc, fields: fields
    });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => { // TODO: finish this by adding role logging
    if (oldMember.user!.bot) return;

    const guild = oldMember.guild;
    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_nickname_change)) return; // will have to update later if I wish to use this for more things than nickname changes

    // not sure how compatible this is with new log function
    const updateEmbed = new MessageEmbed()
        .setColor(0xf6b40c)
        .setAuthor(newMember.user.tag, newMember.user.avatarURL() ?? undefined)
        .setFooter(`${new Date()}`);

    if (oldMember.nickname !== newMember.nickname) {
        updateEmbed
            .setDescription(`**${newMember.user} changed their nickname:**`)
            .addFields(
                {name: 'Before:', value: oldMember.nickname || 'None'},
                {name: 'After:', value: newMember.nickname || 'None'}
            );
        (client.channels.cache.get(tag.logchannel) as TextChannel)?.send(updateEmbed).catch(error => console.error(`guildMemberUpdate in ${guild} could not be logged because of ${error}!`));
    }
});

client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;

    // Enforce blacklist
    if (tag.blacklist.includes(member.id)) {
        await member.ban({reason: 'BLACKLISTED'});
        await log(client, guild, {
            id: tag.logchannel, color: '0x7f0000', author: member.user.tag, authorIcon: member.user.avatarURL(),
            desc: `**User ${member.user} has been banned on join (blacklist)**`
        });
        return;
    }

    // Add specified autoroles
    if (tag.autoroles) {
        const autoroles = tag.autoroles.trim().split(' ');
        // @ts-ignore
        await member.edit({roles: member.roles.cache.array().concat(autoroles)});
    }

    // Log event
    if (tag.logchannel && tag.log_member_join) {
        await log(client, guild, {
            id: tag.logchannel, color: '0x79ff3b', author: 'Member joined the server', authorIcon: member.user.avatarURL(),
            desc: `${member.user} ${member.user.tag}`
        });
    }

    // add potential welcome messages later
});

client.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    const tag = (await client.GuildTags.findOne({ where: { guildID: guild.id } }))!;
    if (!(guild.systemChannel && tag.log_member_leave)) return;

    const leaveEmbed = new MessageEmbed()
        .setColor(0x333333)
        .setAuthor('Member left the server', member.user!.avatarURL() ?? undefined)
        .setDescription(`${member.user} ${member.user!.tag}`)
        .setFooter(new Date());

    guild.systemChannel.send(leaveEmbed).catch(error => console.error(`guildMemberRemove in ${guild} could not be logged because of ${error}!`));
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
