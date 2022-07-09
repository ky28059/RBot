import {Collection, CommandInteraction, Message, PermissionResolvable, Snowflake} from 'discord.js';
import {SlashCommandBuilder, ToAPIApplicationCommandOptions} from '@discordjs/builders';
import {readdirSync} from 'fs';

// Types
import {Guild as GuildPresets} from '../models/Guild';
import {MusicSubscription} from './subscription';


// Fields common to both old and new command syntaxes;
// preconditions are still kept in slash commands for abstraction purposes
type BaseCommand<Target, Args, GuildOnly extends boolean> = {
    aliases?: string[], // NOTE: aliasing a `SlashCommand` will only alias the text-based version of that command.
    examples?: string | string[],
    ownerOnly?: boolean,
    clientPermReqs?: PermissionResolvable,
    execute: (message: Target, parsed: Args, tag: Tag<GuildOnly>) => Promise<any>
}

// A `GuildOnly` command will always have a valid tag passed in because `message.guild` is guaranteed to exist
type Tag<T extends boolean> = T extends true ? GuildPresets : GuildPresets | undefined;

// Old text-based command detail syntax. `name`, `description`, `pattern`, `guildOnly`, and `permReqs` are specified
// explicitly.
export type TextCommand<Args = {}, GuildOnly extends boolean = false> = BaseCommand<Message, Args, GuildOnly> & {
    name: string,
    description: string,
    pattern?: string,
} & (GuildOnly extends true ? {
    // Require `guildOnly` and allow `permReqs` if `GuildOnly` is true.
    guildOnly: GuildOnly
    permReqs?: PermissionResolvable
} : {
    guildOnly?: GuildOnly
})

// New slash command detail syntax. The `SlashCommandBuilder` contains fields corresponding to `name`, `description`,
// `pattern`, `guildOnly`, and `permReqs`.
export type SlashCommand<Args = {}, GuildOnly extends boolean = false> = BaseCommand<Message | CommandInteraction, Args, GuildOnly> & {
    // TODO: is there a better way of writing this type? @discordjs/builders doesn't export an interface for this >:(
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
}

// The actual command object inside RBot, which is a `SlashCommand` merged into old text-based syntax.
type Command<Args, GuildOnly extends boolean, SlashCommandCompat extends boolean> = TextCommand<Args, GuildOnly> & {
    isSlashCommand: SlashCommandCompat,
    commandGroup: string,
    permReqs?: PermissionResolvable
    execute: (SlashCommandCompat extends true ? SlashCommand<Args, GuildOnly> : TextCommand<Args, GuildOnly>)['execute']
}

declare module "discord.js" {
    interface Client {
        // TODO: while `any` might be forced for `Args`, using it for `GuildOnly` might be a little hacky
        // This union allows for narrowing of the `execute` type by checking `isSlashCommand`.
        commands: Collection<string, Command<any, any, true> | Command<any, any, false>>,
        submodules: string[],
        ownerID: Snowflake,
        subscriptions: Map<Snowflake, MusicSubscription>,
        loadCommands(): Promise<void>
    }
}

// Returns the current submodules from subdirectories of `/commands`.
export function getSubmodules() {
    return readdirSync('./commands', {withFileTypes: true})
        .filter(res => res.isDirectory())
        .map(dir => dir.name);
}

// Imports raw command objects given a list of submodules to search, calling the provided callback on each.
export async function forEachRawCommand(submodules: string[], callback: (command: TextCommand<any, any> | SlashCommand<any, any>, dir: string) => void) {
    for (const dir of submodules) {
        const files = readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

        // TODO: imports are relative to `./util/parseCommands`, but fs is relative to `/`.
        // Is there any way to make this behavior more clear?
        for (const file of files)
            callback((await import(`../commands/${dir}/${file.substring(0, file.length - 3)}`)).default, dir);
    }
}

// Parses a command file from `await import(...)` into an RBot command object.
export function parseCommand(command: TextCommand<any, any> | SlashCommand<any, any>, dir: string): Command<any, any, any> {
    let isSlashCommand = false;

    if ('data' in command) {
        // TODO: would using `...command` here have any adverse consequences?
        command = {
            name: command.data.name,
            description: command.data.description,
            pattern: command.data.options.map(parseSlashCommandOption).join(' '),
            guildOnly: command.data.dm_permission,
            ownerOnly: command.ownerOnly,
            permReqs: (command.data.default_member_permissions as PermissionResolvable | null | undefined) || undefined,
            clientPermReqs: command.clientPermReqs,
            execute: command.execute
        }
        isSlashCommand = true;
    }

    return {...command, commandGroup: dir, isSlashCommand};
}

// Parses a SlashCommandBuilder option into RBot's argParser syntax.
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
