import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function set(message, guild, field, args) {
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // TODO: require a different perm for this command
  if (!field) return message.reply('you must specify the token field to modify!');

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);

  switch (field) {
    case 'logchannel':
      const channelTarget = message.mentions.channels.first() || client.channels.cache.get(args[0]);
      if (!channelTarget) return message.reply("please mention a valid channel in this server");

      tokenData.logchannel = channelTarget.id;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! Log channel has been updated to ${channelTarget}!`);
      break;

    case 'prefix':
      const prefix = args.join(" ");
      if (!prefix) return message.reply('you must specify a prefix to set!')

      tokenData.prefix = prefix;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! Prefix has been updated to \`${prefix}\`!`);
      break;

    default:
      return message.reply('you must specify a valid token field to modify! Valid token fields: `logchannel, prefix`');
  }
}
