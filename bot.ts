import {ActivityType, Client, Collection, CommandInteraction, GuildMember, Message, EmbedBuilder, TextChannel} from 'discord.js';
import {Sequelize} from 'sequelize';
import {ownerId, token} from './auth';

// Utils
import {parseSlashCommandArgs, parseTextArgs} from './util/argParser';
import {forEachRawCommand, getSubmodules} from './util/commands';
import loadGuilds, {Guild as GuildPresets} from './models/Guild';
import {log} from './util/logging';
import {isInField, update} from './util/tokens';
import {truncate} from './util/messageUtils';

// Messages
import {err} from './util/messages';
import CommandError from './errors/CommandError';


const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildPresences",
        "GuildMembers",
        "GuildEmojisAndStickers",
        "GuildVoiceStates",
        "GuildMessageReactions",
        "DirectMessages",
        "MessageContent"
    ],
    presence: {activities: [{name: '!help', type: ActivityType.Listening}]},
    allowedMentions: {repliedUser: false}
});

client.commands = new Collection();
client.subscriptions = new Map(); // For music commands

// Dynamic command handling
client.loadCommands = async () => {
    // Load submodules dynamically
    client.submodules = getSubmodules();
    await forEachRawCommand(client.submodules, ({command, dir}) => {
        client.commands.set(command.name, {...command, commandGroup: dir});
    });
    console.log('Commands loaded!');
}


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
    await sequelize.sync(); // Sync database
    console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('guildCreate', async (guild) => {
    await update(guild, client);
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Bot ignores itself and other bots

    if (!message.inGuild()) { // DM forwarding
        const dmEmbed = new EmbedBuilder()
            .setColor(0x7f0000)
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
            .setDescription(`**${message.author} DMed RBot this message:**\n${message.content}`)
            .setFooter({text: new Date().toISOString()});
        await client.users.cache.get(ownerId)?.send({embeds: [dmEmbed]});
    }

    if (talkedRecently.has(message.author.id)) return; // Global spam prevention

    const guild = message.guild;
    const tag = guild && await update(guild, client);
    const prefix = tag?.prefix || '!';

    if (message.content.substring(0, prefix.length) === prefix) {
        // Splits content string by first chunk of whitespace, preserving whitespace in arguments
        const [cmd, argString] = message.content.slice(prefix.length).trim().split(/(?<=^\S+)\s+/);
        const commandName = cmd.toLowerCase();

        if (tag?.disabled_commands && isInField(tag, 'disabled_commands', commandName)) {
            // Handles command disabling
            const embed = err('DISABLED_ERROR', 'Invoked command disabled in current server');
            await message.reply({embeds: [embed]});
            return;
        }

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => !!cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // List of conditions to check before executing command
        if (command.guildOnly && !message.inGuild()) {
            const embed = err('DM_ERROR', 'Guild only command cannot be executed inside DMs');
            await message.reply({embeds: [embed]}).catch();
            return;
        } else if (command.permReqs && !message.member?.permissions.has(command.permReqs)) {
            const embed = err('USER_PERMS_MISSING', `User lacks permissions: \`${command.permReqs}\``);
            await message.reply({embeds: [embed]}).catch();
            return;
        } else if (command.clientPermReqs && !guild?.members.me?.permissions.has(command.clientPermReqs)) {
            const embed = err('CLIENT_PERMS_MISSING', `Client lacks permissions: \`${command.clientPermReqs}\``);
            await message.reply({embeds: [embed]}).catch();
            return;
        } else if (command.ownerOnly && message.author.id !== ownerId) {
            const embed = err('OWNER_ONLY', 'Owner only command cannot be invoked by non owner');
            await message.reply({embeds: [embed]}).catch();
            return;
        }

        try {
            if ('subcommands' in command) {
                const [subcommandName, newArgString] = argString.trim().split(/(?<=^\S+)\s+/);
                const subcommand = command.subcommands.find(cmd => cmd.name === subcommandName);
                if (!subcommand) return; // TODO: error

                const parsed = parseTextArgs(`${command.name} ${subcommand.name}`, subcommand.pattern, newArgString ?? '', client, guild);
                return await subcommand.execute(message, parsed, tag);
            }

            const parsed = parseTextArgs(command.name, command.pattern, argString ?? '', client, guild);
            await command.execute(message, parsed, tag);
        } catch (e) {
            await handleCommandError(message, commandName, e);
        }

        // adds user to set if they have used a command recently
        talkedRecently.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after 1 second
            talkedRecently.delete(message.author.id);
        }, 1000);
    }
});

// Slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command || !command.isSlashCommand) return;

    const guild = interaction.guild;
    const tag = guild && await update(guild, client);

    if (tag?.disabled_commands && isInField(tag, 'disabled_commands', interaction.commandName)) {
        // Handles command disabling
        const embed = err('DISABLED_ERROR', 'Invoked command disabled in current server');
        await interaction.reply({embeds: [embed]});
        return;
    }

    // List of conditions to check before executing command
    if (command.guildOnly && !interaction.inGuild()) {
        const embed = err('DM_ERROR', 'Guild only command cannot be executed inside DMs');
        await interaction.reply({embeds: [embed]}).catch();
        return;
    } else if (command.permReqs && interaction.member instanceof GuildMember && !interaction.member.permissions.has(command.permReqs)) {
        const embed = err('USER_PERMS_MISSING', `User lacks permissions: \`${command.permReqs}\``);
        await interaction.reply({embeds: [embed]}).catch();
        return;
    } else if (command.clientPermReqs && !guild?.members.me?.permissions.has(command.clientPermReqs)) {
        const embed = err('CLIENT_PERMS_MISSING', `Client lacks permissions: \`${command.clientPermReqs}\``);
        await interaction.reply({embeds: [embed]}).catch();
        return;
    } else if (command.ownerOnly && interaction.user.id !== ownerId) {
        const embed = err('OWNER_ONLY', 'Owner only command cannot be invoked by non owner');
        await interaction.reply({embeds: [embed]}).catch();
        return;
    }

    try {
        if ('subcommands' in command) {
            const subcommandName = interaction.options.getSubcommand(true);
            const subcommand = command.subcommands.find(cmd => cmd.name === subcommandName);
            if (!subcommand) return; // TODO: error

            // TODO: this is probably a little hacky
            const parsed = parseSlashCommandArgs(interaction.options.data.find(opt => opt.name === subcommandName)!.options!);
            return await subcommand.execute(interaction, parsed, tag);
        }

        const parsed = parseSlashCommandArgs(interaction.options.data);
        await command.execute(interaction, parsed, tag);
    } catch (e) {
        await handleCommandError(interaction, interaction.commandName, e);
    }
})

async function handleCommandError(message: Message | CommandInteraction, commandName: string, e: unknown) {
    if (!(e instanceof Error)) return;

    // If the error was a result of bad code, log it
    if (!(e instanceof CommandError)) {
        console.error(`Error in command ${commandName} called in ${message.guild?.name ?? 'a DM'} at ${new Date()}: ${e}`);
        console.error(e.stack);
    }
    await message.reply({embeds: [err(e.name, e.message)]}).catch();
}

// Autocomplete
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    const guild = interaction.guild;
    const tag = guild && await GuildPresets.findOne({ where: { guildID: guild.id } });

    if ('subcommands' in command) {
        const subcommandName = interaction.options.getSubcommand(true);
        const subcommand = command.subcommands.find(cmd => cmd.name === subcommandName);
        if (!subcommand || !subcommand.handleAutocomplete) return;
        return subcommand.handleAutocomplete(interaction, tag);
    }

    if (!command.handleAutocomplete) return;
    await command.handleAutocomplete(interaction, tag);
})


// Bot logs the following events:

client.on('messageDelete', async (message) => {
    if (!message.guild) return; // Ignore DMs
    if (message.author?.bot) return; // Ignore other bots

    const tag = (await GuildPresets.findOne({ where: { guildID: message.guild.id } }))!;

    if (tag.censored_users && isInField(tag, 'censored_users', message.author?.id)) return; // prevents double logging of censored messages, probably better way of doing this
    if (!(tag.logchannel && tag.log_message_delete)) return;

    const desc = truncate(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content ?? '*[Partial message]*'}`, 4096); // embed descriptions have a character limit of 4096

    // Add attachments field if message attachments existed
    const fields = message.attachments.size
        ? [{name: 'Attachments:', value: message.attachments.map(a => a.name).join(', ')}]
        : undefined;

    await log(client, message.guild, {
        id: tag.logchannel, color: 0xb50300, author: message.author?.tag, authorIcon: message.member?.displayAvatarURL(),
        desc, fields
    });
});

client.on('messageDeleteBulk', async (messages) => {
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
    if (!oldMessage.guild) return; // Ignore DMs
    if (oldMessage.author?.bot) return; // Ignore other bots
    if (oldMessage.content === newMessage.content) return; // Resolve glitches where old and new content are identical but an event is fired

    const tag = (await GuildPresets.findOne({ where: { guildID: oldMessage.guild.id } }))!;
    if (!(tag.logchannel && tag.log_message_edit)) return;

    const desc = `**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`;
    const fields = [
        {name: 'Before:', value: truncate((oldMessage.content ?? '*[Partial message]*') || '*[Empty message]*', 1024)}, // embed fields have a character limit of 1024
        {name: 'After:', value: truncate((newMessage.content ?? '*[Partial message]*') || '*[Empty message]*', 1024)}
    ];

    await log(client, oldMessage.guild, {
        id: tag.logchannel, color: 0xed7501, author: oldMessage.author?.tag, authorIcon: oldMessage.author?.displayAvatarURL(),
        desc, fields
    });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => { // TODO: finish this by adding role logging
    if (oldMember.user?.bot) return; // Ignore bots

    const tag = (await GuildPresets.findOne({ where: { guildID: oldMember.guild.id } }))!;
    if (!(tag.logchannel && tag.log_nickname_change)) return; // will have to update later if I wish to use this for more things than nickname changes

    // not sure how compatible this is with new log function
    const updateEmbed = new EmbedBuilder()
        .setColor(0xf6b40c)
        .setAuthor({name: newMember.user.tag, iconURL: newMember.displayAvatarURL()})
        .setFooter({text: new Date().toUTCString()});

    if (oldMember.nickname !== newMember.nickname) {
        updateEmbed
            .setDescription(`**${newMember.user} changed their nickname:**`)
            .addFields(
                {name: 'Before:', value: oldMember.nickname || 'None', inline: true},
                {name: 'After:', value: newMember.nickname || 'None', inline: true}
            );
        (client.channels.cache.get(tag.logchannel) as TextChannel)?.send({embeds: [updateEmbed]})
            .catch(error => console.error(`guildMemberUpdate in ${oldMember.guild} could not be logged because of ${error}!`));
    }
});

client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;

    if (tag.blacklist.includes(member.id)) { // Enforces blacklist
        await member.ban({reason: 'Blacklisted user'});
        await log(client, guild, {
            id: tag.logchannel, color: 0x7f0000, author: member.user.tag, authorIcon: member.displayAvatarURL(),
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
            id: tag.logchannel, color: 0x79ff3b, author: 'Member joined the server', authorIcon: member.displayAvatarURL(),
            desc: `${member.user} ${member.user.tag}`
        });
    }
    // add potential welcome messages later
});

client.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    const tag = (await GuildPresets.findOne({ where: { guildID: guild.id } }))!;
    if (!(guild.systemChannel && tag.log_member_leave)) return;

    const leaveEmbed = new EmbedBuilder()
        .setColor(0x333333)
        .setAuthor({name: 'Member left the server', iconURL: member.displayAvatarURL()})
        .setDescription(`${member.user} ${member.user.tag}`)
        .setFooter({text: new Date().toUTCString()});

    guild.systemChannel.send({embeds: [leaveEmbed]}).catch(error => console.error(`guildMemberRemove in ${guild} could not be logged because of ${error}!`));
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
