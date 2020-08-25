import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function uncensor(message, guild, target) { // target = User
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?
  if (!target) return message.reply("please mention a valid member of this server");

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (!tokenData.censoredusers.includes(target.id)) return message.reply("that user was not censored!");

  tokenData.censoredusers = tokenData.censoredusers.replace(target.id + ' ', '');
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Now uncensoring ${target.tag}!`);
}
