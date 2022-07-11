import {Collection, CommandInteraction, Message, Permissions, PermissionResolvable, Snowflake, AutocompleteInteraction} from 'discord.js';
import {SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from '@discordjs/builders';
import {
    APIApplicationCommandOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType
} from 'discord-api-types/v10';
import {readdirSync} from 'fs';

// Types
import {Guild as GuildPresets} from '../models/Guild';
import {MusicSubscription} from './subscription';


type BaseCommandOpts = {
    aliases?: string[], // NOTE: aliasing a `SlashCommand` will only alias the text-based version of that command.
    examples?: string | string[],
    ownerOnly?: boolean
}
type GuildOnlyBaseCommandOpts = BaseCommandOpts & {
    clientPermReqs?: PermissionResolvable
}

// A `GuildOnly` command will always have a valid tag passed in because `message.guild` is guaranteed to exist
type Tag<T extends boolean> = T extends true ? GuildPresets : GuildPresets | null;
type CommandCallback<Target, Args, GuildOnly extends boolean> = (message: Target, parsed: Args, tag: Tag<GuildOnly>) => Promise<any>


type SlashCommandData = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
type SlashCommandOpts = {
    data: SlashCommandData,
    handleAutocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}
// Creates a non-guild-only slash command. Pass command properties to this function using the `SlashCommandBuilder`,
// or pass extra options as `opts`.
export function createSlashCommand<Args = {}>(
    command: BaseCommandOpts & SlashCommandOpts & { execute: CommandCallback<Message | CommandInteraction, Args, false> }
): Command<Args, false, true> {
    const {data, ...opts} = command;
    const permissions = new Permissions((data.default_member_permissions || undefined) as PermissionResolvable | undefined).toArray()
    return {
        isSlashCommand: true,
        guildOnly: false, //data.dm_permission
        name: data.name,
        description: data.description,
        pattern: data.options.map((arg) => parseSlashCommandOption(arg.toJSON())).join(' '),
        permReqs: permissions.length ? permissions : undefined,
        ...opts
    }
}

// Creates a guild-only slash command. This command's usage will be restricted to guilds, but will have access
// to a non-nullable `Tag` and guild-specific properties like `permReqs` and `clientPermReqs`. **Important:** ensure
// that the `SlashCommandBuilder` has a call to `.setDMPermission(false)`, or else the slash command will be
// usable in DMs.
export function createGuildOnlySlashCommand<Args = {}>(
    command: GuildOnlyBaseCommandOpts & SlashCommandOpts & { execute: CommandCallback<Message | CommandInteraction, Args, true> }
): Command<Args, true, true> {
    const {data, ...opts} = command;
    const permissions = new Permissions((data.default_member_permissions || undefined) as PermissionResolvable | undefined).toArray()
    return {
        isSlashCommand: true,
        guildOnly: true, //data.dm_permission
        name: data.name,
        description: data.description,
        pattern: data.options.map((arg) => parseSlashCommandOption(arg.toJSON())).join(' '),
        permReqs: permissions.length ? permissions : undefined,
        ...opts
    }
}


type TextCommandOpts = {
    name: string,
    description: string,
    pattern?: string,
}
// Creates a non-guild-only text command. Pass command properties to this function as `opts`.
export function createTextCommand<Args = {}>(
    command: BaseCommandOpts & TextCommandOpts & { execute: CommandCallback<Message, Args, false> }
): Command<Args, false, false> {
    return {
        isSlashCommand: false,
        guildOnly: false,
        ...command,
    }
}

type GuildOnlyTextCommandOpts = TextCommandOpts & {
    permReqs?: PermissionResolvable,
}
// Creates a guild-only text command. This command's usage will be restricted to guilds, but will have access
// to a non-nullable `Tag` and guild-specific properties like `permReqs` and `clientPermReqs`.
export function createGuildOnlyTextCommand<Args = {}>(
    command: GuildOnlyBaseCommandOpts & GuildOnlyTextCommandOpts & { execute: CommandCallback<Message, Args, true> }
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
function parseSlashCommandOption(data: APIApplicationCommandOption) {
    let prefix = '';
    let bracket = '[]';

    switch (data.type) {
        // TODO: bracket = () corresponds to integers only; should `argParser` support doubles too?
        case ApplicationCommandOptionType.Integer: bracket = '()'; break;
        case ApplicationCommandOptionType.User: prefix = '@'; break;
        case ApplicationCommandOptionType.Channel: prefix = '#'; break;
        case ApplicationCommandOptionType.Role: prefix = '&'; break;
    }

    let pattern = `${prefix}${bracket[0]}${data.name}${bracket[1]}`

    if ('max_value' in data) pattern += `[${data.min_value}-${data.max_value}]`;
    if (!data.required) pattern += '?';

    return pattern;
}
