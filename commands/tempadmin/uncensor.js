import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export async function uncensor(message, target, client) { // target = User
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?
  if (!target) return message.reply("please mention a valid member of this server");

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (!tokenData.censoredusers.includes(target.id)) return message.reply("that user was not censored!");

  tokenData.censoredusers = tokenData.censoredusers.replace(target.id + ' ', '');
  if (tokenData.logchannel) await log(client, guild, 0x7f0000, target.tag, target.avatarURL(), `**${target} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Now uncensoring ${target.tag}!`);
}
