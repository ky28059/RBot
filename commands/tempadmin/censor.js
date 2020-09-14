import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export async function censor (message, target, client) { // target = User
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?

  if (!target) return message.reply("please mention a valid member of this server");
  if (target.id === message.author.id) return message.reply("you cannot censor yourself!");
  if (target.bot) return message.reply("bots cannot be censored!"); // should bots be allowed to be censored?

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (tokenData.censoredusers.includes(target.id)) return message.reply("that user is already censored!");

  tokenData.censoredusers += target.id + ' ';
  if (tokenData.logchannel) await log(client, guild, 0x7f0000, target.tag, target.avatarURL(), `**${target} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Now censoring ${target.tag}!`);
}
