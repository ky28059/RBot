import {isInField, addToField} from '../../utils/tokenManager.js';
import {log} from '../utils/logger.js';

// Errors
import ArgumentError from '../../errors/ArgumentError.js';


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
        if (!commands) throw new ArgumentError(this.name, 'Missing field `[Commands]`');

        let disables = [];

        for (let command of commands) {
            if (command === 'disable' || command === 'enable')
                throw new ArgumentError(this.name, `Cannot disable \`${command}\``);

            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd)
                throw new ArgumentError(this.name, `Command \`${command}\` does not exist`);
            if (isInField(tag, 'disabled_commands', command))
                throw new ArgumentError(this.name, `Command \`${command}\` already disabled`);
            if (disables.includes(cmd.name))
                throw new ArgumentError(this.name, `Attempt to disable \`${command}\` twice`);

            // Add command and aliases to the disables array
            disables.push(cmd.name);
            if (cmd.aliases) disables = disables.concat(cmd.aliases);
        }

        await addToField(tag, 'disabled_commands', disables);
        await log(client, guild, tag, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${disables.join(', ')}] were disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Disabling \`[${disables.join(', ')}]\`!`);
    }
}
