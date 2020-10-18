import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export default {
    name: 'uncensor',
    description: 'Uncensor a user.',
    usage: 'uncensor @[user]',
    examples: 'uncensor @example',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;
        if (!userTarget) return message.reply("please mention a valid member of this server");

        const path = `./tokens/${guild.id}.json`;
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        const tokenData = await readToken(guild);
        if (!tokenData.censoredusers.includes(userTarget.id)) return message.reply("that user was not censored!");

        tokenData.censoredusers = tokenData.censoredusers.replace(userTarget.id + ' ', '');
        await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Now uncensoring ${userTarget.tag}!`);
    }
}
