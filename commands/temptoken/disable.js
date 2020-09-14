import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export async function disable(message, command, commands, client) {
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('ADMINISTRATOR')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?

  if (!command) return message.reply("please mention a command name to disable!");
  if (command === 'disable' || command === 'enable') return message.reply('you cannot disable !disable/!enable');
  if (!Object.keys(commands).includes(command)) return message.reply('that command does not exist!');

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (tokenData.disabledcommands.includes(command)) return message.reply("that command is already disabled!");

  tokenData.disabledcommands += command + ' ';
  if (tokenData.logchannel) await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Command ${command} was disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Disabling \`${command}\`!`);
}
