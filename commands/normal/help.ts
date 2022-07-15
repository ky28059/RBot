import {createSlashCommand} from '../../utils/commands';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {requestedBy} from '../../utils/messages';

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
                commandListEmbed.addField(
                    module,
                    [...client.commands.values()]
                        .filter(cmd => cmd.commandGroup === module)
                        .map(cmd => cmd.name)
                        .join(', '),
                    true
                );
            }

            return replyEmbed(message, commandListEmbed);
        }

        // If there were arguments given
        const command = commands.get(name.toLowerCase()) || commands.find(c => !!c.aliases && c.aliases.includes(name));
        if (!command)
            throw new IllegalArgumentError('help', `\`${name}\` is not a valid command.`);

        const isSubCommand = 'subcommands' in command;

        // If there were arguments given and the argument was a valid command, display info about that command
        const helpEmbed = requestedBy(author(message))
            .setTitle(command.name)
            .setDescription(`\`\`\`cs\n[${command.commandGroup}]${(command.guildOnly ? ' [guildOnly]' : '')}${(command.isSlashCommand ? ' [slashCommand]' : '')}\n\`\`\`${command.description}`);

        if (command.aliases) helpEmbed.addField('**Aliases:**', command.aliases.join(', '));
        if (isSubCommand) helpEmbed.addField(
            '**Subcommands:**',
            command.subcommands.map((cmd) => `**${command.name} ${cmd.name}** - ${cmd.description}`).join('\n')
        );
        helpEmbed.addField('**Usage:**', isSubCommand
            ? command.subcommands.map((cmd) => `${prefix}${command.name} ${cmd.name} ${cmd.pattern || ''}`).join('\n')
            : `${prefix}${command.name} ${command.pattern || ''}`
        );

        // TODO: these fields should really be arrays only to simplify parsing
        if (command.examples) helpEmbed.addField('**Examples:**',
            Array.isArray(command.examples) ? command.examples.map(example => prefix + example).join('\n') : prefix + command.examples);

        if (command.permReqs) helpEmbed.addField(
            '**Permissions required:**',
            Array.isArray(command.permReqs) ? command.permReqs.map(p => `\`${p}\``).join(', ') : `\`${command.permReqs.toString()}\``,
            true
        );
        if (command.clientPermReqs) helpEmbed.addField(
            '**Client permissions required:**',
            Array.isArray(command.clientPermReqs) ? command.clientPermReqs.map(p => `\`${p}\``).join(', ') : `\`${command.clientPermReqs.toString()}\``,
            true
        );

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
