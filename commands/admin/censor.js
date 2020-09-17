import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export default {
  name: 'censor',
  guildOnly: true,
  permReqs: 'KICK_MEMBERS',
  clientPermReqs: 'MANAGE_MESSAGES',
  async execute(message, args, userTarget, memberTarget, channelTarget, roleTarget, client) {
    const guild = message.guild;

    if (!userTarget) return message.reply("please mention a valid member of this server");
    if (userTarget.id === message.author.id) return message.reply("you cannot censor yourself!");
    if (userTarget.bot) return message.reply("bots cannot be censored!"); // should bots be allowed to be censored?

    const path = `./tokens/${guild.id}.json`;
    if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

    const tokenData = await readToken(guild);
    if (tokenData.censoredusers.includes(userTarget.id)) return message.reply("that user is already censored!");

    tokenData.censoredusers += userTarget.id + ' ';
    await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Now censoring ${userTarget.tag}!`);
  }
}
