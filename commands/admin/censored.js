import {MessageEmbed} from 'discord.js';
import {readToken} from '../utils/tokenManager.js';
import fs from 'fs';

export default {
  name: 'censored',
  guildOnly: true,
  async execute(message, args, userTarget, memberTarget, channelTarget, roleTarget, client) {
    const guild = message.guild;
    const path = `./tokens/${guild.id}.json`;
    if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

    const tokenData = await readToken(guild);

    const censoredListEmbed = new MessageEmbed()
        .setColor(0x333333)
        .setTitle('Censored Users:')
        .setFooter(`Requested by ${message.author.tag}`);

    if (!tokenData.censoredusers) {
      censoredListEmbed.setDescription('No one is censored!')
    } else {
      let censoredList = tokenData.censoredusers.trim().split(' ');
      censoredList.forEach(user =>
          censoredListEmbed.addField(client.users.cache.get(user) ? client.users.cache.get(user).tag : 'Error getting user tag', client.users.cache.get(user) ? client.users.cache.get(user).id : 'Error getting user id')
      )
    }
    message.channel.send(censoredListEmbed);
  }
}
