import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';
import {log} from "../utils/logger.js";

export default {
    name: 'enable',
    description: 'Enable a disabled command.',
    usage: 'enable [command name]',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to reenable!");

        const path = `./tokens/${guild.id}.json`;
        const tokenData = await readToken(guild);

        for (let command of commands) {
            if (!client.commands.has(command)) return message.reply(`the command ${command} does not exist!`);
            if (!tokenData.disabledcommands.includes(command)) return message.reply(`the command ${command} was not disabled!`);

            tokenData.disabledcommands = tokenData.disabledcommands.replace(command + ' ', '');
        }

        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Commands [${commands.join(', ')}] were reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Reenabling \`[${commands.join(', ')}]\`!`);
    }
}
