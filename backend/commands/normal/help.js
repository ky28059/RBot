import {MessageEmbed} from 'discord.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';

export default {
    name: 'help',
    description: 'Gets info about a command.',
    pattern: '[Command]?',
    examples: 'help censor',
    async execute(message, parsed, client, tag) {
        /*
        // https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
        const helpEmbed1 = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Non-Admin Commands:')
            .addFields(
                {name: '!ping:', value: 'Gets latency'},
                {name: '!say [message]:', value: 'Makes bot say what you tell it to say'},
                {
                    name: '!avatar @[user]:',
                    value: 'Gets the discord avatar of the mentioned user, defaults to get your avatar when no user is mentioned'
                },
                {name: '!profile @[user]:', value: 'Gets some information about the mentioned user'},
                {
                    name: '!mcstatus [ip]:',
                    value: 'Gets the server status (player count and version requirement) of the specified server'
                },
                {
                    name: '!react [emoji or emoji id]:',
                    value: 'Reacts to the previous message with the specified emoji(s)'
                },
                {name: '!gild:', value: 'Gives some Reddit gold to the previous message'}
            )
            .setFooter(`Requested by ${message.author.tag}`);
        const helpEmbed2 = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Admin Commands:')
            .addFields(
                {
                    name: '!purge [2-100]:',
                    value: 'Bulk deletes the specified number of messages in the channel the command is called in\n[PERMS REQUIRED: MANAGE_MESSAGES]'
                },
                {
                    name: '!expunge [2-100]:',
                    value: 'Removes all reactions from the specifed number of messages in the channel the command is called in\n[PERMS REQUIRED: MANAGE_MESSAGES]'
                },
                {
                    name: '!kick @[user] [reason]:',
                    value: 'Kicks the specified user from the server\n[PERMS REQUIRED: KICK_MEMBERS]'
                },
                {
                    name: '!ban @[user] [reason]:',
                    value: 'Bans the specified user from the server\n[PERMS REQUIRED: BAN_MEMBERS]'
                },
                {
                    name: '!censor @[user]:',
                    value: 'Censors the specified user (autodeletes their messages and logs it in the log channel)\n[PERMS REQUIRED: MANAGE_MESSAGES]'
                },
                {name: '!uncensor @[user]:', value: 'Uncensors the specified user\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
                {name: '!censored:', value: 'Shows which users are currently censored'},
                {
                    name: '!addemote [image link] [name]:',
                    value: 'Creates an emoji with the given image and name\n[PERMS REQUIRED: MANAGE_EMOJIS]'
                } // this feels awkward here
            )
            .setFooter(`Requested by ${message.author.tag}`);
        const helpEmbed3 = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Token Commands:')
            .addFields(
                {name: '!update:', value: 'Updates the server\'s token'},
                {name: '!set [token field] [value]:', value: 'Sets token data\n[PERMS REQUIRED: MANAGE_GUILD]'},
                {
                    name: '!toggle [logged action]:',
                    value: 'Toggles whether RBot will log that action\n[PERMS REQUIRED: MANAGE_GUILD]'
                },
                {
                    name: '!disable [command name]:',
                    value: 'Disables the use of the given command for this server\n[PERMS REQUIRED: ADMINISTRATOR]'
                },
                {
                    name: '!enable [command name]:',
                    value: 'Enables the use of the given command for this server\n[PERMS REQUIRED: ADMINISTRATOR]'
                },
                {
                    name: '!autorole [add/remove] @[role]:',
                    value: 'Adds or removed a role from RBot\'s autorole functionality\n[PERMS REQUIRED: MANAGE_GUILD]'
                },
                {name: '!presets:', value: 'Gets the values of the server\'s current presets'}
            )
            .setFooter(`Requested by ${message.author.tag}`);

        // high level reaction listening
        const helpMessage = await message.channel.send(helpEmbed1);
        await helpMessage.react('1️⃣');
        await helpMessage.react('2️⃣');
        await helpMessage.react('3️⃣');

        const filter = (reaction, user) => ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = helpMessage.createReactionCollector(filter, {time: 15000});

        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case '1️⃣':
                    helpMessage.edit(helpEmbed1);
                    break;
                case '2️⃣':
                    helpMessage.edit(helpEmbed2);
                    break;
                case '3️⃣':
                    helpMessage.edit(helpEmbed3);
                    break;
            }
        });
        collector.on('end', () => helpMessage.reactions.removeAll());
        */
        const commands = client.commands;
        const name = parsed.command;

        let prefix = '!';
        const guild = message.guild;
        if (guild) prefix = tag.prefix;

        // If there were no arguments given
        if (!name) {
            // Return a list of all commands
            const commandListEmbed = new MessageEmbed()
                .setColor(0x333333)
                .setTitle('Command List')
                .setDescription(`Use \`${prefix}help [Command]\` for information about a command.`)
                .setFooter(`Requested by ${message.author.tag}`);

            for (const module of client.submodules)
                commandListEmbed.addField(module,
                    client.commands.array().filter(cmd => cmd.commandGroup === module).map(cmd => cmd.name).join(', '), true);

            return message.channel.send(commandListEmbed);
        }

        // If there were arguments given
        const command = commands.get(name.toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(name));
        if (!command) throw new IllegalArgumentError(this.name, `Command \`${name}\` not a valid command`);

        // If there were arguments given and the argument was a valid command
        const helpEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(`${command.name}`)
            .setFooter(`Requested by ${message.author.tag}`);

        if (command.description) helpEmbed.setDescription(`${command.description}`);
        if (command.commandGroup) helpEmbed.addField('**Command Group:**', `${command.commandGroup}`);
        if (command.aliases) helpEmbed.addField('**Aliases:**', `${command.aliases.join(', ')}`);
        helpEmbed.addField('**Usage:**', `${prefix}${command.name} ${command.pattern || ''}`);

        // Better way of doing the following 2 fields?
        if (command.examples) {
            if (Array.isArray(command.examples)) {
                helpEmbed.addField('**Examples:**', `${command.examples.map(example => prefix + example).join('\n')}`);
            } else {
                helpEmbed.addField('**Example:**', `${prefix}${command.examples}`);
            }
        }
        if (command.permReqs) {
            if (Array.isArray(command.permReqs)) {
                helpEmbed.addField('**Permissions Required:**', `${command.permReqs.join(', ')}`);
            } else {
                helpEmbed.addField('**Permissions Required:**', `${command.permReqs}`);
            }
        }

        message.channel.send(helpEmbed);
    }
}
