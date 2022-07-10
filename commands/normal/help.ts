import {createSlashCommand} from '../../utils/parseCommands';
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
            throw new IllegalArgumentError('help', `Command \`${name}\` not a valid command`);

        // If there were arguments given and the argument was a valid command, display info about that command
        const helpEmbed = requestedBy(author(message)).setTitle(command.name);

        if (command.description) helpEmbed.setDescription(command.description);
        if (command.commandGroup) helpEmbed.addField('**Command Group:**', command.commandGroup);
        if (command.aliases) helpEmbed.addField('**Aliases:**', command.aliases.join(', '));
        helpEmbed.addField('**Usage:**', `${prefix}${command.name} ${command.pattern || ''}`);

        // TODO: these fields should really be arrays only to simplify parsing
        if (command.examples) helpEmbed.addField('**Examples:**',
            Array.isArray(command.examples) ? command.examples.map(example => prefix + example).join('\n') : prefix + command.examples);
        if (command.permReqs) helpEmbed.addField('**Permissions Required:**',
            Array.isArray(command.permReqs) ? command.permReqs.join(', ') : command.permReqs.toString());

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
