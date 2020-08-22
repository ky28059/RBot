import Discord from 'discord.js';
import {readToken} from '../utils/tokenManager.js';

export async function presets(message, guild) {
  const tokenData = await readToken(guild);
  // TODO: make this embed look better
  const tokenEmbed = new Discord.MessageEmbed()
    .setColor(0x333333)
    .setTitle('Presets:')
    .addFields( // TODO: make a for each loop that adds available fields automatically so this command won't need to be manually updated
      {name: 'Prefix:', value: tokenData.prefix || '!'},
      {name: 'Log Channel:', value: tokenData.logchannel || 'None'},
      {name: 'Disabled Commands:', value: tokenData.disabledcommands ? tokenData.disabledcommands.trim().split(' ').join(', ') : 'None'},
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
