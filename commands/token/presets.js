import {MessageEmbed} from 'discord.js';
import {readToken} from '../utils/tokenManager.js';

export default {
    name: 'presets',
    description: 'Displays this server\'s current settings (log channel, disabled commands, etc.).',
    usage: 'presets',
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message) {
        const tokenData = await readToken(message.guild);

        // TODO: make this embed look better
        const tokenEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Presets:')
            .addFields( // TODO: make a for each loop that adds available fields automatically so this command won't need to be manually updated
                {name: 'Prefix:', value: tokenData.prefix || '!'},
                {name: 'Log Channel:', value: tokenData.logchannel || 'None'},
                {
                    name: 'Disabled Commands:',
                    value: tokenData.disabledcommands ? tokenData.disabledcommands.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Auto Roles:',
                    value: tokenData.autoroles ? tokenData.autoroles.trim().split(' ').join(', ') : 'None'
                },
                {
                    name: 'Censored Users:',
                    value: tokenData.censoredusers ? tokenData.censoredusers.trim().split(' ').join(', ') : 'No one'
                },
                {
                    name: 'Blacklist:',
                    value: tokenData.blacklist ? tokenData.blacklist.trim().split(' ').join(', ') : 'No one'
                },
                {name: 'Message Deletes', value: tokenData.logmessagedelete, inline: true},
                {name: 'Bulk Message Deletes', value: tokenData.logmessagedeletebulk, inline: true},
                {name: 'Message Edits', value: tokenData.logmessageedit, inline: true},
                {name: 'Nickname Changes', value: tokenData.lognicknamechange, inline: true},
                {name: 'Member Joins', value: tokenData.logmemberjoin, inline: true},
                {name: 'Member Leaves', value: tokenData.logmemberleave, inline: true}
            )
            .setFooter(`Requested by ${message.author.tag}`);

        message.channel.send(tokenEmbed);
    }
}
