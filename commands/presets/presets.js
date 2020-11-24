import {MessageEmbed} from 'discord.js';

export default {
    name: 'presets',
    description: 'Displays this server\'s current settings (log channel, disabled commands, etc.).',
    usage: 'presets',
    examples: 'presets',
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;

        const disabledCommands = tag.disabled_commands;
        const autoroles = tag.autoroles;
        const censoredUsers = tag.censored_users;
        const blacklist = tag.blacklist;

        // TODO: make this embed look better
        const tokenEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Presets:')
            .addFields( // TODO: make a for each loop that adds available fields automatically so this command won't need to be manually updated
                {name: 'Prefix:', value: tag.prefix || '!'},
                {name: 'Log Channel:', value: tag.logchannel || 'None'},
                {
                    name: 'Disabled Commands:',
                    value: disabledCommands ? disabledCommands.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Auto Roles:',
                    value: autoroles ? autoroles.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Censored Users:',
                    value: censoredUsers ? censoredUsers.trim().split(' ').join(', ') : 'No one'
                },
                {
                    name: 'Blacklist:',
                    value: blacklist ? blacklist.trim().split(' ').join(', ') : 'No one'
                },
                {name: 'Message Deletes', value: tag.log_message_delete, inline: true},
                {name: 'Bulk Message Deletes', value: tag.log_message_delete_bulk, inline: true},
                {name: 'Message Edits', value: tag.log_message_edit, inline: true},
                {name: 'Nickname Changes', value: tag.log_nickname_change, inline: true},
                {name: 'Member Joins', value: tag.log_member_join, inline: true},
                {name: 'Member Leaves', value: tag.log_member_leave, inline: true}
            )
            .setFooter(`Requested by ${message.author.tag}`);

        message.channel.send(tokenEmbed);
    }
}
