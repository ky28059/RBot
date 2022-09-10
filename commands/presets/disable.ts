import {createGuildOnlySlashCommand} from '../../utils/commands';
import {Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {isInField, addToField} from '../../utils/tokens';
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';
import {log} from '../../utils/logger';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export const data = new SlashCommandBuilder()
    .setName('disable')
    .setDescription('Disables a command.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to disable.')
        .setRequired(true)
        .setAutocomplete(true))

export default createGuildOnlySlashCommand<{command: string}>({
    data,
    examples: 'disable ban',
    async execute(message, parsed, tag) {
        const {command} = parsed;
        const client = message.client;

        if (command === 'disable' || command === 'enable')
            throw new IllegalArgumentError(data.name, `Cannot disable protected command \`${command}\`.`);

        const toDisable: string[] = [];

        const cmd = client.commands.get(command.toLowerCase())
            || client.commands.find(c => !!c.aliases && c.aliases.includes(command));

        if (!cmd)
            throw new IllegalArgumentError(data.name, `Command \`${command}\` does not exist.`);
        if (isInField(tag, 'disabled_commands', command))
            throw new IllegalArgumentError(data.name, `Command \`${command}\` is already disabled.`);

        // Add command and aliases to the disables array
        toDisable.push(cmd.name);
        if (cmd.aliases) toDisable.push(...cmd.aliases);

        await addToField(tag, 'disabled_commands', toDisable);
        await log(client, message.guild!, {
            id: tag.logchannel, color: 0xf6b40c, author: author(message).tag, authorIcon: author(message).displayAvatarURL(),
            desc: `**Commands [${toDisable.join(', ')}] were disabled by ${author(message).tag} in ${message.channel}**${message instanceof Message ? `\n[Jump to message](${message.url})` : ''}`
        });

        await replyEmbed(message, success().setDescription(`Disabled \`[${toDisable.join(', ')}]\`.`));
    },
    async handleAutocomplete(interaction, tag) {
        const focused = interaction.options.getFocused();
        const choices = [...interaction.client.commands.keys()]
            .filter(command => command.startsWith(focused.toString()))
            .filter(command => !isInField(tag, 'disabled_commands', command))
            .slice(0, 25)
        await interaction.respond(choices.map(command => ({name: command, value: command})));
    }
});
