import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export default {
  name: 'enable',
  guildOnly: true,
  permReqs: 'ADMINISTRATOR',
  async execute(message, args, userTarget, memberTarget, channelTarget, roleTarget, client) {
    const guild = message.guild;
    const command = args[0];

    if (!command) return message.reply("please mention a command name to reenable!");

    const path = `./tokens/${guild.id}.json`;
    const tokenData = await readToken(guild);
    if (!tokenData.disabledcommands.includes(command)) return message.reply("that command was not disabled!");

    tokenData.disabledcommands = tokenData.disabledcommands.replace(command + ' ', '');
    await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Command ${command} was reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Reenabling \`${command}\`!`);
  }
}
