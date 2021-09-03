import {CommandInteraction, Message, MessageEmbed} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {Guild} from '../../models/Guild';
import {author, reply} from "../../utils/messageUtils";


export default {
    data: new SlashCommandBuilder()
        .setName('presets')
        .setDescription('Displays this server\'s current settings (log channel, disabled commands, etc.).'),
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message: Message | CommandInteraction, parsed: {}, tag: Guild) {
        const {disabled_commands, autoroles, censored_users, censored_words, blacklist} = tag;

        // TODO: make this embed look better
        const tokenEmbed = new MessageEmbed()
            .setColor(0x333333)
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
                    name: 'Censored Users:',
                    value: censored_users ? censored_users.trim().split(' ').join(', ') : 'No one'
                },
                {
                    name: 'Censored Phrases:',
                    value: censored_words ? censored_words.trim().split('ҩ').join('\n') : 'Nothing'
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
            ])
            .setFooter(`Requested by ${author(message).tag}`);

        await reply(message, {embeds: [tokenEmbed]});
    }
}
