import {isInField, addToField} from '../../utils/tokenManager.js';
import {log} from '../../utils/logger.ts';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'disable',
    description: 'Disables a command.',
    pattern: '[...Commands]',
    examples: 'disable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const commands = parsed.commands;

        let disables = [];

        for (let command of commands) {
            if (command === 'disable' || command === 'enable')
                throw new IllegalArgumentError(this.name, `Cannot disable \`${command}\``);

            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd)
                throw new IllegalArgumentError(this.name, `Command \`${command}\` does not exist`);
            if (isInField(tag, 'disabled_commands', command))
                throw new IllegalArgumentError(this.name, `Command \`${command}\` already disabled`);
            if (disables.includes(cmd.name))
                throw new IllegalArgumentError(this.name, `Attempt to disable \`${command}\` twice`);

            // Add command and aliases to the disables array
            disables.push(cmd.name);
            if (cmd.aliases) disables = disables.concat(cmd.aliases);
        }

        await addToField(tag, 'disabled_commands', disables);
        await log(client, guild, tag.logchannel, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${disables.join(', ')}] were disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Disabling \`[${disables.join(', ')}]\`!`);
    }
}
