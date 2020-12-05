import {isInField, addToField} from '../../utils/tokenManager.js';
import {log} from '../utils/logger.js';

export default {
    name: 'disable',
    description: 'Disables a command.',
    usage: 'disable [command name]',
    examples: 'disable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to disable!");

        let disables = [];

        for (let command of commands) {
            if (command === 'disable' || command === 'enable') return message.reply(`you cannot disable \`${command}\`!`);

            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd) return message.reply(`the command \`${command}\` does not exist!`);
            if (isInField(tag, 'disabled_commands', command)) return message.reply(`the command \`${command}\` is already disabled!`);
            if (disables.includes(cmd.name)) return message.reply(`you cannot disable \`${command}\` twice!`);

            // Add command and aliases to the disables array
            disables.push(cmd.name);
            if (cmd.aliases) disables = disables.concat(cmd.aliases);
        }

        await addToField(tag, 'disabled_commands', disables);
        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${disables.join(', ')}] were disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Disabling \`[${disables.join(', ')}]\`!`);
    }
}
