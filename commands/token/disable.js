import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function disable(message, guild, command) {
  if (!guild.member(message.author).hasPermission('ADMINISTRATOR')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?

  if (!command) return message.reply("please mention a command name to disable!");
  // TODO: check command against existing commands so that nonesistant commands cant be "disabled"

  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);
  if (tokenData.disabledcommands.includes(command)) return message.reply("that command is already disabled!");

  tokenData.disabledcommands += command + ' ';
  await writeFile(path, JSON.stringify(tokenData));
  message.channel.send(`Disabling \`${command}\`!`);
}
