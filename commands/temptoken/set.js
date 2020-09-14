import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function set(message, field, args, client) {
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('MANAGE_GUILD')) return message.reply('you do not have sufficient perms to do that!');
  if (!field) return message.reply('you must specify the token field to modify!');

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  let updated;

  switch (field) {
    case 'logchannel':
      const channelTarget = message.mentions.channels.first() || client.channels.cache.get(args[0]);
      if (!channelTarget) return message.reply("please mention a valid channel in this server");

      tokenData.logchannel = channelTarget.id;
      updated = channelTarget;
      break;

    case 'prefix':
      const prefix = args.join(" ");
      if (!prefix) return message.reply('you must specify a prefix to set!')

      tokenData.prefix = prefix;
      updated = prefix;
      break;

    default:
      return message.reply('you must specify a valid token field to modify! Valid token fields: `logchannel, prefix`');
  }
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Success! ${field} has been updated to ${updated}!`);
}
