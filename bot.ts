import {Client, Message, MessageEmbed, Collection, Guild, PermissionResolvable, TextChannel, Snowflake} from 'discord.js';
import {MusicSubscription} from './commands/utils/subscription';
import {Sequelize} from 'sequelize';
import yargs from 'yargs';
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

// Database
import {offload, onload} from './utils/JSONOffloader';
import loadGuilds, {Guild as GuildPresets} from './models/Guild';


// https://github.com/yargs/yargs/blob/master/docs/typescript.md
const flags = yargs(process.argv.slice(2)).options({
    onload: { type: 'boolean', default: false },
    offload: { type: 'boolean', default: false },
}).parseSync();

type Command = {
    name: string,
    commandGroup: string,
    aliases?: string[],
    description: string,
    pattern?: string,
    examples: string | string[],
    guildOnly?: boolean,
    ownerOnly?: boolean,
    permReqs?: PermissionResolvable,
    clientPermReqs?: PermissionResolvable,
    execute: (message: Message, parsed: any, client: RBot, tag: GuildPresets | undefined) => Promise<void>
}
export class RBot extends Client {
    commands: Collection<string, Command> = new Collection()
    submodules: string[] = ['admin', 'music', 'normal', 'owner', 'presets']
    ownerID: string = '355534246439419904' // For owner only commands
    subscriptions: Map<Snowflake, MusicSubscription> = new Map()

    // Dynamic command handling
    async loadCommands() {
        for (let dir of this.submodules) {
            const commands = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

            for (let file of commands) {
                let command = await import(`./commands/${dir}/${file}`);
                command = command.default; // Required because of default exports
                command.commandGroup = dir; // Dynamic commandgroups
                this.commands.set(command.name, command);
            }
        }
        console.log('Commands loaded!');
    }
}
const client = new RBot({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES",
        "GUILD_MEMBERS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGE_REACTIONS",
        "DIRECT_MESSAGES"
    ],
    presence: {activities: [{name: '!help', type: "LISTENING"}]}
});

// Models
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
loadGuilds(sequelize);


const talkedRecently = new Set(); // For global cooldowns; consider switching to command specific cooldowns?


// Run initial stuff
client.once('ready', async () => {
    await client.loadCommands(); // Load commands
    if (flags.offload) await offload();

    await sequelize.sync(); // Sync database

    if (flags.onload) await onload();
    console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('guildCreate', async guild => {
    await update(guild, client);
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return; // Bot ignores itself and other bots

    if (message.channel.type === 'DM') { // DM forwarding
        const dmEmbed = new MessageEmbed()
            .setColor(0x7f0000)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**${message.author} DMed RBot this message:**\n${message.content}`)
            .setFooter(`${new Date()}`);
        await client.users.cache.get(client.ownerID)?.send({embeds: [dmEmbed]});
    }

    if (talkedRecently.has(message.author.id)) return; // Global spam prevention

    let prefix = '!';
    let tag;
    let member;
    let guild: Guild | undefined;

    if (message.guild) {
        // Server specific Tag reliant things (censorship, custom prefix)
        guild = message.guild;
        member = guild.members.cache.get(message.author.id)!;

        await update(guild, client);
        tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
        prefix = tag.prefix;

        // Handles censorship
        if (
            (tag.censored_users && isInField(tag, 'censored_users', message.author.id)
            || (tag.censored_words && containsField(tag, 'censored_words', message.content, 'ҩ')))
            && !member.permissions.has('ADMINISTRATOR') // Admin override
        ) {
            await message.delete()
                .catch(error => console.error(`message in ${guild} could not be censored because of ${error}!`));

            await log(client, guild, {
                id: tag.logchannel, color: 0x7f0000, author: message.author.tag, authorIcon: message.author.displayAvatarURL(),
                desc: `**Message by ${message.author} censored in ${message.channel}:**\n${message.content}`
            });
            return;
        }
    }

    if (message.content.substring(0, prefix.length) === prefix) {
        // Splits content string by first chunk of whitespace, preserving whitespace in arguments
        const [cmd, argString] = message.content.slice(prefix.length).trim().split(/(?<=^\S+)\s+/);
        const commandName = cmd.toLowerCase();

        if (message.guild
            && tag?.disabled_commands
            && isInField(tag, 'disabled_commands', commandName)
        ) {
            // Handles command disabling
            const embed = err('DISABLED_ERROR', 'Invoked command disabled in current server');
            await message.reply({embeds: [embed]});
            return;
        }

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => !!cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // List of conditions to check before executing command
        if (command.guildOnly && message.channel.type === 'DM') {
            const embed = err('DM_ERROR', 'Guild only command cannot be executed inside DMs');
            await message.reply({embeds: [embed]});
            return;
        } else if (command.permReqs && !member?.permissions.has(command.permReqs)) {
            const embed = err('USER_PERMS_MISSING', `User lacks permissions: \`${command.permReqs}\``);
            await message.reply({embeds: [embed]});
            return;
        } else if (command.clientPermReqs && !guild?.me?.permissions.has(command.clientPermReqs)) {
            const embed = err('CLIENT_PERMS_MISSING', `Client lacks permissions: \`${command.clientPermReqs}\``);
            await message.reply({embeds: [embed]});
            return;
        } else if (command.ownerOnly && message.author.id !== client.ownerID) {
            const embed = err('OWNER_ONLY', 'Owner only command cannot be invoked by non owner');
            await message.reply({embeds: [embed]});
            return;
        }

        try {
            const parsed = parse(argString ?? '', command, client, guild);
            await command.execute(message, parsed, client, tag);
        } catch (e) {
            // If the error was a result of bad code, log it
            if (!(e instanceof CommandError)) {
                console.error(`Error in command ${commandName} called in ${guild?.name ?? 'a DM'} at ${new Date()}: ${e}`);
            }
            await message.reply({embeds: [err(e.name, e.message)]});
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
    if (message.author?.bot) return; // Bot ignores itself and other bots

    const guild = message.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;

    if (tag.censored_users && isInField(tag, 'censored_users', message.author?.id)) return; // prevents double logging of censored messages, probably better way of doing this
    if (!(tag.logchannel && tag.log_message_delete)) return;

    let desc = truncateMessage(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content}`, -48) // Unlike messages, embed descriptions have a character limit of 2048
    await log(client, guild, {
        id: tag.logchannel, color: 0xb50300, author: message.author?.tag, authorIcon: message.author?.displayAvatarURL(),
        desc: desc
    });
});

client.on('messageDeleteBulk', async messages => {
    const first = messages.first()!;
    const guild = first.guild!;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_message_delete_bulk)) return;

    // temporary Dyno-like bulkdelete logging system, will convert into superior system later
    await log(client, guild, {
        id: tag.logchannel, color: 0xb50300, author: guild.name, authorIcon: guild.iconURL(),
        desc: `**${messages.size} messages were deleted in ${first.channel}**`
    });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!oldMessage.guild) return; // Ignores DMs
    if (oldMessage.author?.bot) return; // Bot ignores itself and other bots
    if (oldMessage.content === newMessage.content) return; // fixes weird link preview glitch

    const guild = oldMessage.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_message_edit)) return;

    let desc = `**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`;
    let truncatedBefore = truncateMessage(oldMessage.content ?? '*Partial message*', 976); // Unlike messages, embed fields have a character limit of 1024
    let truncatedAfter = truncateMessage(newMessage.content ?? '*Partial message*', 976);
    let fields = [{name: 'Before:', value: truncatedBefore}, {name: 'After:', value: truncatedAfter}];

    await log(client, guild, {
        id: tag.logchannel, color: 0xed7501, author: oldMessage.author?.tag, authorIcon: oldMessage.author?.displayAvatarURL(),
        desc: desc, fields: fields
    });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => { // TODO: finish this by adding role logging
    if (oldMember.user?.bot) return;

    const guild = oldMember.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
    if (!(tag.logchannel && tag.log_nickname_change)) return; // will have to update later if I wish to use this for more things than nickname changes

    // not sure how compatible this is with new log function
    const updateEmbed = new MessageEmbed()
        .setColor(0xf6b40c)
        .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
        .setFooter(`${new Date()}`);

    if (oldMember.nickname !== newMember.nickname) {
        updateEmbed
            .setDescription(`**${newMember.user} changed their nickname:**`)
            .addFields(
                {name: 'Before:', value: oldMember.nickname || 'None'},
                {name: 'After:', value: newMember.nickname || 'None'}
            );
        (client.channels.cache.get(tag.logchannel) as TextChannel)?.send({embeds: [updateEmbed]}).catch(error => console.error(`guildMemberUpdate in ${guild} could not be logged because of ${error}!`));
    }
});

client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;

    if (tag.blacklist.includes(member.id)) { // Enforces blacklist
        await member.ban({reason: 'Blacklisted user'});
        await log(client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: member.user.tag, authorIcon: member.user.displayAvatarURL(),
            desc: `**User ${member.user} has been banned on join (blacklist)**`
        });
        return;
    }

    if (tag.autoroles) { // Adds autoroles
        const autoroles = tag.autoroles.trim().split(' ');
        await member.edit({roles: [...member.roles.cache.keys()].concat(autoroles)});
    }

    // Log event
    if (tag.logchannel && tag.log_member_join) {
        await log(client, guild, {
            id: tag.logchannel, color: 0x79ff3b, author: 'Member joined the server', authorIcon: member.user.displayAvatarURL(),
            desc: `${member.user} ${member.user.tag}`
        });
    }
    // add potential welcome messages later
});

client.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
    if (!(guild.systemChannel && tag.log_member_leave)) return;

    const leaveEmbed = new MessageEmbed()
        .setColor(0x333333)
        .setAuthor('Member left the server', member.user?.displayAvatarURL())
        .setDescription(`${member.user} ${member.user?.tag ?? ''}`)
        .setFooter(`${new Date()}`);

    guild.systemChannel.send({embeds: [leaveEmbed]}).catch(error => console.error(`guildMemberRemove in ${guild} could not be logged because of ${error}!`));
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
