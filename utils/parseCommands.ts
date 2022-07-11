import {Collection, CommandInteraction, Message, Permissions, PermissionResolvable, Snowflake, AutocompleteInteraction} from 'discord.js';
import {SlashCommandBuilder, ToAPIApplicationCommandOptions} from '@discordjs/builders';
import {readdirSync} from 'fs';

// Types
import {Guild as GuildPresets} from '../models/Guild';
import {MusicSubscription} from './subscription';
import {APIApplicationCommandIntegerOption, APIApplicationCommandOption} from 'discord-api-types/v10';


type BaseCommandOpts = {
    aliases?: string[], // NOTE: aliasing a `SlashCommand` will only alias the text-based version of that command.
    examples?: string | string[],
    ownerOnly?: boolean
}

// A `GuildOnly` command will always have a valid tag passed in because `message.guild` is guaranteed to exist
type Tag<T extends boolean> = T extends true ? GuildPresets : GuildPresets | undefined;
type CommandCallback<Target, Args, GuildOnly extends boolean> = (message: Target, parsed: Args, tag: Tag<GuildOnly>) => Promise<any>


type SlashCommandData = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
type SlashCommandOpts<Args, GuildOnly extends boolean> = {
    data: SlashCommandData,
    clientPermReqs?: PermissionResolvable,
    execute: CommandCallback<Message | CommandInteraction, Args, GuildOnly>,
    handleAutocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}
export function createSlashCommand<Args = {}, GuildOnly extends boolean = false>(
    command: BaseCommandOpts & SlashCommandOpts<Args, GuildOnly>
): Command<Args, GuildOnly, true> {
    const {data, ...opts} = command;
    const permissions = new Permissions((data.default_member_permissions || undefined) as PermissionResolvable | undefined).toArray()
    return {
        isSlashCommand: true,
        name: data.name,
        description: data.description,
        pattern: data.options.map(parseSlashCommandOption).join(' '),
        guildOnly: (data.dm_permission || false) as GuildOnly,
        permReqs: permissions.length ? permissions : undefined,
        ...opts
    }
}


type TextCommandOpts = {
    name: string,
    description: string,
    pattern?: string,
}
export function createTextCommand<Args = {}>(
    command: BaseCommandOpts & TextCommandOpts & { execute: CommandCallback<Message, Args, false> }
): Command<Args, false, false> {
    return {
        isSlashCommand: false,
        guildOnly: false,
        ...command,
    }
}

type GuildOnlyTextCommandOpts = {
    permReqs?: PermissionResolvable,
    clientPermReqs?: PermissionResolvable
}
export function createGuildOnlyTextCommand<Args = {}>(
    command: BaseCommandOpts & TextCommandOpts & GuildOnlyTextCommandOpts & { execute: CommandCallback<Message, Args, true> }
): Command<Args, true, false> {
    return {
        isSlashCommand: false,
        guildOnly: true,
        ...command,
    }
}

// The target type of the factory functions, a `SlashCommand` merged into old text-based syntax with
// extra compatibility metadata.
type Command<Args, GuildOnly extends boolean, SlashCommandCompat extends boolean> = BaseCommandOpts & {
    isSlashCommand: SlashCommandCompat,
    name: string,
    description: string,
    pattern?: string,
    guildOnly: GuildOnly,
    permReqs?: PermissionResolvable,
    clientPermReqs?: PermissionResolvable,
    execute: SlashCommandCompat extends true
        ? CommandCallback<Message | CommandInteraction, Args, GuildOnly>
        : CommandCallback<Message, Args, GuildOnly>,
    // TODO: is there a type-safe way to express that this is always undefined when `SlashCommandCompat` is false?
    handleAutocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}

// The type of the command object inside RBot, which contains a dynamic `commandGroup` field and is narrowable
// via union to determine slash command compatibility depending on the value of `isSlashCommand`.
// TODO: while `any` might be forced for `Args`, using it for `GuildOnly` might be a little hacky
export type ParsedCommand = (Command<any, any, true> | Command<any, any, false>) & {commandGroup: string};

declare module "discord.js" {
    interface Client {
        commands: Collection<string, ParsedCommand>,
        submodules: string[],
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
export async function forEachRawCommand(
    submodules: string[],
    callback: (data: {command: Command<any, any, any>, data?: SlashCommandData, dir: string}) => void
) {
    for (const dir of submodules) {
        const files = readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

        // TODO: imports are relative to `./util/parseCommands`, but fs is relative to `/`.
        // Is there any way to make this behavior more clear?
        for (const file of files) {
            const command = await import(`../commands/${dir}/${file.substring(0, file.length - 3)}`);
            callback({
                command: command.default,
                data: command.data,
                dir
            });
        }
    }
}

// Parses a SlashCommandBuilder option into RBot's argParser syntax.
function parseSlashCommandOption(arg: ToAPIApplicationCommandOptions) {
    const data = arg.toJSON();
    let prefix = '';
    let bracket = '[]';

    switch (data.type) {
        // TODO: bracket = () corresponds to integers only; should `argParser` support doubles too?
        case 4: bracket = '()'; break;
        case 6: prefix = '@'; break;
        case 7: prefix = '#'; break;
        case 8: prefix = '&'; break;
    }

    let pattern = `${prefix}${bracket[0]}${data.name}${bracket[1]}`

    if ('max_value' in data) pattern += `[${data.min_value}-${data.max_value}]`;
    if (!data.required) pattern += '?';

    return pattern;
}
