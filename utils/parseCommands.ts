import {CommandInteraction, Message, PermissionResolvable} from 'discord.js';
import {SlashCommandBuilder, ToAPIApplicationCommandOptions} from '@discordjs/builders';
import {Guild as GuildPresets} from '../models/Guild';


// Fields common to both old and new command syntaxes;
// preconditions are still kept in slash commands for abstraction purposes
type BaseCommand = {
    isSlashCommand?: boolean,
    commandGroup: string,
    examples?: string | string[],
    guildOnly?: boolean,
    ownerOnly?: boolean,
    permReqs?: PermissionResolvable,
    clientPermReqs?: PermissionResolvable,
    execute: (message: Message | CommandInteraction, parsed: any, tag: GuildPresets | undefined) => Promise<void>
}
// Old text based command detail syntax
export type Command = BaseCommand & {
    name: string,
    aliases?: string[],
    description: string,
    pattern?: string,
}
// New slash command detail syntax
export type SlashCommand = BaseCommand & {
    data: SlashCommandBuilder,
}

// Parses a command file from `await import(...)` into an RBot command object
export function parseCommand(command: Command | SlashCommand, dir: string): Command {
    if ('data' in command) {
        // TODO: would using `...command` here have any adverse consequences?
        command = {
            isSlashCommand: true,
            name: command.data.name,
            commandGroup: dir,
            description: command.data.description,
            pattern: command.data.options.map(parseSlashCommandOption).join(' '),
            guildOnly: command.guildOnly,
            ownerOnly: command.ownerOnly,
            permReqs: command.permReqs,
            clientPermReqs: command.clientPermReqs,
            execute: command.execute
        }
    }

    return {...command, commandGroup: dir};
}

// Parses a SlashCommandBuilder option into RBot's argParser syntax
function parseSlashCommandOption(arg: ToAPIApplicationCommandOptions) {
    const data = arg.toJSON();
    let prefix = '';
    let bracket = '[]'

    switch (data.type) {
        case 4:
        case 10:
            bracket = '()'
            break;
        case 6:
            prefix = '@';
            break;
        case 7:
            prefix = '#';
            break;
        case 8:
            prefix = '&';
            break;
    }

    return `${prefix}${bracket[0]}${data.name}${bracket[1]}${data.required ? '' : '?'}`
}
