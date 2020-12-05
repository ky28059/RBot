import {isInField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'enable',
    description: 'Enables a disabled command.',
    usage: 'enable [command name]',
    examples: 'enable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to reenable!");

        let enables = [];

        for (let command of commands) {
            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd) return message.reply(`the command \`${command}\` does not exist!`);
            if (!isInField(tag, 'disabled_commands', command)) return message.reply(`the command \`${command}\` was not disabled!`);
            if (enables.includes(cmd.name)) return message.reply(`you cannot enable \`${command}\` twice!`);

            // Add command and aliases to the disables array
            enables.push(cmd.name);
            if (cmd.aliases) enables = enables.concat(cmd.aliases);
        }

        await removeFromField(tag, 'disabled_commands', enables);
        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${enables.join(', ')}] were reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Reenabling \`[${enables.join(', ')}]\`!`);
    }
}
