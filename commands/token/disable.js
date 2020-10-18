import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'disable',
    description: 'Disables a command.',
    usage: 'disable [command name]',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to disable!");

        const path = `./tokens/${guild.id}.json`;
        const tokenData = await readToken(guild);

        for (let command of commands) {
            if (command === 'disable' || command === 'enable') return message.reply(`you cannot disable ${command}!`);
            if (!client.commands.has(command)) return message.reply(`the command ${command} does not exist!`);
            if (tokenData.disabledcommands.includes(command)) return message.reply(`the command ${command} is already disabled!`);

            tokenData.disabledcommands += command + ' ';
        }

        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Commands [${commands.join(', ')}] were disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Disabling \`[${commands.join(', ')}]\`!`);
    }
}
