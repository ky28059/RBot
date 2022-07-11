import {isInField, removeFromField} from '../../utils/tokens.ts';
import {log} from '../../utils/logger.ts';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'enable',
    description: 'Enables a disabled command.',
    pattern: '[...Commands]',
    examples: 'enable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const commands = parsed.commands;

        let enables = [];

        for (let command of commands) {
            const cmd = client.commands.get(command.toLowerCase())
                || client.commands.find(c => c.aliases && c.aliases.includes(command));
            if (!cmd)
                throw new IllegalArgumentError(this.name, `Command \`${command}\` does not exist`);
            if (!isInField(tag, 'disabled_commands', command))
                throw new IllegalArgumentError(this.name, `Command \`${command}\` not disabled`);
            if (enables.includes(cmd.name))
                throw new IllegalArgumentError(this.name, `Attempt to enable \`${command}\` twice`);

            // Add command and aliases to the disables array
            enables.push(cmd.name);
            if (cmd.aliases) enables = enables.concat(cmd.aliases);
        }

        await removeFromField(tag, 'disabled_commands', enables);
        await log(client, guild, tag.logchannel, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**Commands [${enables.join(', ')}] were reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Reenabling \`[${enables.join(', ')}]\`!`);
    }
}
