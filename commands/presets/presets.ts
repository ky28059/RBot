import {createGuildOnlySlashCommand} from '../../utils/commands';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {requestedBy} from '../../utils/messages';



export const data = new SlashCommandBuilder()
    .setName('presets')
    .setDescription('Displays this server\'s current settings (log channel, disabled commands, etc.).')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

export default createGuildOnlySlashCommand({
    data,
    async execute(message, parsed, tag) {
        const {disabled_commands, autoroles, censored_users, censored_words, blacklist} = tag;

        // TODO: make this embed look better
        const tokenEmbed = requestedBy(author(message))
            .setTitle('Presets:')
            .addFields([ // TODO: make a for each loop that adds available fields automatically so this command won't need to be manually updated
                {name: 'Prefix:', value: tag.prefix || '!'},
                {name: 'Log Channel:', value: tag.logchannel || 'None'},
                {
                    name: 'Disabled Commands:',
                    value: disabled_commands ? disabled_commands.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Auto Roles:',
                    value: autoroles ? autoroles.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Blacklist:',
                    value: blacklist ? blacklist.trim().split(' ').join(', ') : 'No one'
                },
                {name: 'Message Deletes', value: tag.log_message_delete + '', inline: true},
                {name: 'Bulk Message Deletes', value: tag.log_message_delete_bulk + '', inline: true},
                {name: 'Message Edits', value: tag.log_message_edit + '', inline: true},
                {name: 'Nickname Changes', value: tag.log_nickname_change + '', inline: true},
                {name: 'Member Joins', value: tag.log_member_join + '', inline: true},
                {name: 'Member Leaves', value: tag.log_member_leave + '', inline: true}
            ]);

        await replyEmbed(message, tokenEmbed);
    }
});
