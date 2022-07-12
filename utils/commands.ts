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


// A `GuildOnly` command will always have a valid tag passed in because `message.guild` is guaranteed to exist
type Tag<T extends boolean> = T extends true ? GuildPresets : GuildPresets | null;
type CommandCallback<Target, Args, GuildOnly extends boolean> = (message: Target, parsed: Args, tag: Tag<GuildOnly>) => Promise<any>


type BaseCommandOpts = {
    aliases?: string[], // NOTE: aliasing a `SlashCommand` will only alias the text-based version of that command.
    examples?: string | string[],
    ownerOnly?: boolean
}
type GuildOnlyBaseCommandOpts = BaseCommandOpts & {
    clientPermReqs?: PermissionResolvable
}

type SlashCommandData = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
type SlashCommandOpts<Args> = {
    data: SlashCommandData,
    execute: CommandCallback<Message | CommandInteraction, Args, false>,
    handleAutocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}
// Creates a non-guild-only slash command. Pass command properties to this function using the `SlashCommandBuilder`,
// or pass extra options as `opts`.
export function createSlashCommand<Args = {}>(
    command: BaseCommandOpts & SlashCommandOpts<Args>
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

type GuildOnlySlashCommandOpts<Args> = Omit<SlashCommandOpts<Args>, 'execute'> & {
    execute: CommandCallback<Message | CommandInteraction, Args, true>
}
// Creates a guild-only slash command. This command's usage will be restricted to guilds, but will have access
// to a non-nullable `Tag` and guild-specific properties like `permReqs` and `clientPermReqs`. **Important:** ensure
// that the `SlashCommandBuilder` has a call to `.setDMPermission(false)`, or else the slash command will be
// usable in DMs.
export function createGuildOnlySlashCommand<Args = {}>(
    command: GuildOnlyBaseCommandOpts & GuildOnlySlashCommandOpts<Args>
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

type SlashCommandSubCommandsOpts<Args> = {
    data: SlashCommandSubcommandsOnlyBuilder
    subcommands: { [P in keyof Args]: Omit<GuildOnlySlashCommandOpts<Args[P]>, 'data'> }
}
export function createGuildOnlySlashSubCommands<Args = {}>(
    command: BaseCommandOpts & SlashCommandSubCommandsOpts<Args>,
): CommandWithSubCommands<Args, true, true> {
    const {data, subcommands: execData, ...opts} = command;

    const json = data.toJSON();
    const permissions = new Permissions((json.default_member_permissions || undefined) as PermissionResolvable | undefined).toArray()
    const subcommands = json.options!
        .filter((opt): opt is APIApplicationCommandSubcommandOption => opt.type === ApplicationCommandOptionType.Subcommand)
        .map(opt => ({
            name: opt.name,
            description: opt.description,
            pattern: opt.options?.map(parseSlashCommandOption).join(' '),
            ...execData[opt.name as keyof Args]
        }));

    return {
        isSlashCommand: true,
        guildOnly: true,
        name: data.name,
        description: data.description,
        permReqs: permissions.length ? permissions : undefined,
        subcommands,
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

// The target type of the command factory functions, a `SlashCommand` merged into old text-based syntax with
// extra compatibility metadata.
type Command<Args, GuildOnly extends boolean, SlashCommandCompat extends boolean> = BaseCommandOpts
    & CommandExecutionData<Args, GuildOnly, SlashCommandCompat>
    & CommandMetadata<GuildOnly, SlashCommandCompat>;

type CommandMetadata<GuildOnly extends boolean, SlashCommandCompat extends boolean> = {
    isSlashCommand: SlashCommandCompat,
    guildOnly: GuildOnly,
    permReqs?: PermissionResolvable,
    clientPermReqs?: PermissionResolvable,
}
export type CommandExecutionData<Args, GuildOnly extends boolean, SlashCommandCompat extends boolean> = {
    name: string,
    description: string,
    pattern?: string,
    execute: SlashCommandCompat extends true
        ? CommandCallback<Message | CommandInteraction, Args, GuildOnly>
        : CommandCallback<Message, Args, GuildOnly>,
    // TODO: is there a type-safe way to express that this is always undefined when `SlashCommandCompat` is false?
    handleAutocomplete?: (interaction: AutocompleteInteraction) => Promise<any>
}

// The target type of the subcommand factory functions
type CommandWithSubCommands<Args, GuildOnly extends boolean, SlashCommandCompat extends boolean> = BaseCommandOpts
    & CommandMetadata<GuildOnly, SlashCommandCompat> & {
    name: string,
    description: string,
    subcommands: CommandExecutionData<Args[keyof Args], GuildOnly, SlashCommandCompat>[]
};

// The type of the command object inside RBot, which contains a dynamic `commandGroup` field and is narrowable
// via union to determine slash command compatibility depending on the value of `isSlashCommand`.
// TODO: while `any` might be forced for `Args`, using it for `GuildOnly` might be a little hacky
export type ParsedCommand = (Command<any, any, true> | Command<any, any, false> | CommandWithSubCommands<any, any, true>) & {commandGroup: string};

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
    callback: (data: {command: Command<any, any, any> | CommandWithSubCommands<any, any, any>, data?: SlashCommandData | SlashCommandSubcommandsOnlyBuilder, dir: string}) => void
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
