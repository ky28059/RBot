import {createGuildOnlySlashCommand} from '../../util/commands';
import {Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {isInField, removeFromField} from '../../util/tokens';
import {author, replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';
import {log} from '../../util/logging';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export const data = new SlashCommandBuilder()
    .setName('enable')
    .setDescription('Enables a command.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to enable.')
        .setRequired(true)
        .setAutocomplete(true))

export default createGuildOnlySlashCommand<{command: string}>({
    data,
    examples: 'enable ban',
    async execute(message, parsed, tag) {
        const {command} = parsed;
        const client = message.client;

        const toEnable: string[] = [];

        const cmd = client.commands.get(command.toLowerCase())
            || client.commands.find(c => !!c.aliases && c.aliases.includes(command));

        if (!cmd)
            throw new IllegalArgumentError(data.name, `Command \`${command}\` does not exist.`);
        if (!isInField(tag, 'disabled_commands', command))
            throw new IllegalArgumentError(data.name, `Command \`${command}\` was not disabled.`);

        // Add command and aliases to the disables array
        toEnable.push(cmd.name);
        if (cmd.aliases) toEnable.push(...cmd.aliases);

        await removeFromField(tag, 'disabled_commands', toEnable);
        await log(client, message.guild!, {
            id: tag.logchannel, color: 0xf6b40c, author: author(message).tag, authorIcon: author(message).displayAvatarURL(),
            desc: `**Commands [${toEnable.join(', ')}] were enabled by ${author(message).tag} in ${message.channel}**${message instanceof Message ? `\n[Jump to message](${message.url})` : ''}`
        });

        await replyEmbed(message, success().setDescription(`Enabled \`[${toEnable.join(', ')}]\`.`));
    },
    async handleAutocomplete(interaction, tag) {
        const focused = interaction.options.getFocused();
        const choices = [...interaction.client.commands.keys()]
            .filter(command => command.startsWith(focused.toString()))
            .filter(command => isInField(tag, 'disabled_commands', command))
            .slice(0, 25)
        await interaction.respond(choices.map(command => ({name: command, value: command})));
    }
});
