import {createSlashCommand} from '../../util/commands';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {author, replyEmbed} from '../../util/messageUtils';
import {requestedBy} from '../../util/messages';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Gets info about a command, or sends a command list.')
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to get info about.')
        .setAutocomplete(true))

export default createSlashCommand<{command?: string}>({
    data,
    examples: 'help purge',
    async execute(message, parsed, tag) {
        const client = message.client;
        const commands = client.commands;
        const name = parsed.command;

        const prefix = tag?.prefix ?? '!';

        // If there were no arguments given
        if (!name) {
            // Return a list of all commands
            const commandListEmbed = requestedBy(author(message))
                .setTitle('Command List')
                .setDescription(`Use \`${prefix}help [Command]\` for information about a command.`);

            for (const module of client.submodules) {
                commandListEmbed.addFields({
                    name: module,
                    value: [...client.commands.values()]
                        .filter(cmd => cmd.commandGroup === module)
                        .map(cmd => cmd.name)
                        .join(', '),
                    inline: true
                });
            }

            return replyEmbed(message, commandListEmbed);
        }

        // If there were arguments given
        const command = commands.get(name.toLowerCase()) || commands.find(c => !!c.aliases && c.aliases.includes(name));
        if (!command)
            throw new IllegalArgumentError(data.name, `\`${name}\` is not a valid command.`);

        const isSubCommand = 'subcommands' in command;

        // If there were arguments given and the argument was a valid command, display info about that command
        const helpEmbed = requestedBy(author(message))
            .setTitle(command.name)
            .setDescription(`\`\`\`cs\n[${command.commandGroup}]${(command.guildOnly ? ' [guildOnly]' : '')}${(command.ownerOnly ? ' [ownerOnly]' : '')}${(command.isSlashCommand ? ' [slashCommand]' : '')}\n\`\`\`${command.description}`);

        if (command.aliases) helpEmbed.addFields({name: '**Aliases:**', value: command.aliases.join(', ')});
        if (isSubCommand) helpEmbed.addFields({
            name: '**Subcommands:**',
            value: command.subcommands.map((cmd) => `**${command.name} ${cmd.name}** - ${cmd.description}`).join('\n')
        });
        helpEmbed.addFields({
            name: '**Usage:**',
            value: isSubCommand
                ? command.subcommands.map((cmd) => `${prefix}${command.name} ${cmd.name} ${cmd.pattern || ''}`).join('\n')
                : `${prefix}${command.name} ${command.pattern || ''}`
        });

        // TODO: these fields should really be arrays only to simplify parsing
        if (command.examples) helpEmbed.addFields({
            name: '**Examples:**',
            value: Array.isArray(command.examples) ? command.examples.map(example => prefix + example).join('\n') : prefix + command.examples
        });

        if (command.permReqs) helpEmbed.addFields({
            name: '**Permissions required:**',
            value: Array.isArray(command.permReqs) ? command.permReqs.map(p => `\`${p}\``).join(', ') : `\`${command.permReqs.toString()}\``,
            inline: true
        });
        if (command.clientPermReqs) helpEmbed.addFields({
            name: '**Client permissions required:**',
            value: Array.isArray(command.clientPermReqs) ? command.clientPermReqs.map(p => `\`${p}\``).join(', ') : `\`${command.clientPermReqs.toString()}\``,
            inline: true
        });

        await replyEmbed(message, helpEmbed);
    },
    async handleAutocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const choices = [...interaction.client.commands.keys()]
            .filter(command => command.startsWith(focused.toString()))
            .slice(0, 25)
        await interaction.respond(choices.map(command => ({name: command, value: command})));
    }
});
