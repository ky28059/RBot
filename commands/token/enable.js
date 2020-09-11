import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export async function enable(message, command, client) {
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('ADMINISTRATOR')) return message.reply('you do not have sufficient perms to do that!');
  if (!command) return message.reply("please mention a command name to reenable!");

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (!tokenData.disabledcommands.includes(command)) return message.reply("that command was not disabled!");

  tokenData.disabledcommands = tokenData.disabledcommands.replace(command + ' ', '');
  if (tokenData.logchannel) await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Command ${command} was reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Reenabling \`${command}\`!`);
}
