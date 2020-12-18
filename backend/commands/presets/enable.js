import {isInField, removeFromField} from '../../utils/tokenManager.js';
import {log} from '../utils/logger.js';

// Errors
import ArgumentError from '../../errors/ArgumentError.js';


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
        if (!commands) throw new ArgumentError(this.name, 'Missing field `[Commands]`');

        let enables = [];

        for (let command of commands) {
            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd)
                throw new ArgumentError(this.name, `Command \`${command}\` does not exist`);
            if (!isInField(tag, 'disabled_commands', command))
                throw new ArgumentError(this.name, `Command \`${command}\` not disabled`);
            if (enables.includes(cmd.name))
                throw new ArgumentError(this.name, `Attempt to enable \`${command}\` twice`);

            // Add command and aliases to the disables array
            enables.push(cmd.name);
            if (cmd.aliases) enables = enables.concat(cmd.aliases);
        }

        await removeFromField(tag, 'disabled_commands', enables);
        await log(client, guild, tag, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${enables.join(', ')}] were reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Reenabling \`[${enables.join(', ')}]\`!`);
    }
}
