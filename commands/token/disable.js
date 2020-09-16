import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import {log} from "../utils/logger.js";

export default {
  name: 'disable',
  guildOnly: true,
  permReqs: 'ADMINISTRATOR',
  async execute(message, args, userTarget, memberTarget, channelTarget, roleTarget, client) {
    const guild = message.guild;
    const command = args[0];

    if (!command) return message.reply("please mention a command name to disable!");
    if (command === 'disable' || command === 'enable') return message.reply('you cannot disable the disable / enable commands!');
    if (!client.commands.has(command)) return message.reply('that command does not exist!');

    const path = `./tokens/${guild.id}.json`;
    const tokenData = await readToken(guild);
    if (tokenData.disabledcommands.includes(command)) return message.reply("that command is already disabled!");

    tokenData.disabledcommands += command + ' ';
    await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Command ${command} was disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Disabling \`${command}\`!`);
  }
}
