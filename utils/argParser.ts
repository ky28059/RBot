import {ApplicationCommandOptionType, Client, CommandInteractionOption, Guild} from 'discord.js';

// Errors
import MissingArgumentError from '../errors/MissingArgumentError';
import IntegerRangeError from "../errors/IntegerRangeError";
import IntegerConversionError from "../errors/IntegerConversionError";
import ChannelConversionError from '../errors/ChannelConversionError';
import UserConversionError from '../errors/UserConversionError';
import RoleConversionError from '../errors/RoleConversionError';
import EmojiConversionError from '../errors/EmojiConversionError';
import DurationConversionError from '../errors/DurationConversionError';


// Regexes to get ID from mention (<@!someid> => someid)
const mentionRegex = /^<@!?(\d+)>$/;
const channelRegex = /^<#(\d+)>$/;
const roleRegex = /^<@&(\d+)>$/;
const emojiRegex = /^<a?:\w+:(\d+)>$/;

const timeRegex = /(?:(\d+)\s*d(?:ays?)?)?\s*(?:(\d+)\s*h(?:(?:ou)?rs?)?)?\s*(?:(\d+)\s*m(?:in(?:ute)?s?)?)?\s*(?:(\d+)\s*s(?:ec(?:ond)?s?)?)?/i;


// Parses an `argString` into command arguments for the given `ParserCommand`. Throws conversion errors if an
// argument is of the wrong type, and `MissingArgumentError`s if a required argument is missing.
export function parseTextArgs(commandName: string, pattern: string | undefined, argString: string, client: Client, guild: Guild | null) {
    const parsed: any = {};
    let index = 0; // Current index in the string for <Rest> patterns

    // Get argument patterns if they exist, return if the command takes in no arguments or if patterns are missing
    if (!pattern) return;
    const patterns = pattern.split(' ');

    // Split by spaces, but preserve sequences with spaces that are enclosed in quotes
    // Regex taken from HarVM
    const args = argString.match(/("(?:[^"\\]|\\.)*")|[^\s]+/g);

    // Go down the queue of args and attempt to match 1:1 to patterns
    for (let i = 0; i < patterns.length; i++) {

        const pattern = patterns[i].match(/^(?<prefix>[@#&:]?)(?<bracket>[<\[({])(?<repeating>(?:\.{3})?)(?<name>\w+)[})\]>](?:\[(?<rangeFrom>\d+)-(?<rangeTo>\d+)])?(?<optional>\??)$/)!;
        // @ts-ignore
        const { name, bracket, prefix, repeating, optional, rangeFrom, rangeTo } = pattern.groups;

        // If no args were provided, or if none remain
        if (!args || !args.length) {
            // Throw MissingArgumentError if a required argument is not found
            if (!optional) throw new MissingArgumentError(commandName, name);
            // Break the loop as no arguments remaining means no more parsing can be done
            break;
        }

        let arg = args.shift()!;
        index = argString.indexOf(arg, index) + arg.length;

        // Special case for <Rest> patterns
        // Can probably be simplified
        if (bracket === '<') {
            // Check for bad patterns
            if (repeating)
                console.warn(`Bad pattern in ${commandName}, field <${name}> cannot be repeating`);
            if (prefix)
                console.warn(`Bad pattern in ${commandName}, field <${name}> cannot have a prefix`);
            if (i !== patterns.length - 1)
                console.warn(`Bad pattern in ${commandName}, field <${name}> is not the last field`);

            parsed[name.toLowerCase()] = argString.substring(index - arg.length);
            return parsed;
        }

        // If repeating, match remaining args and return
        if (repeating) {
            // Check for bad patterns
            if (i !== patterns.length - 1)
                console.warn(`Bad pattern in ${commandName}, repeating field ${name} is not the last field`);

            args.unshift(arg)
            parsed[name.toLowerCase()] = args
                .map(arg => arg.replace(/^"|"$/g, '')) // Sanitize quotes
                .map(arg => matchSingular({
                    arg, prefix, bracket, argName: name, commandName, repeating: true, rangeFrom, rangeTo,
                    client, guild
                }));

            return parsed;
        }

        // Otherwise, match arg based on prefix
        arg = arg.replace(/^"|"$/g, ''); // Sanitize quotes
        parsed[name.toLowerCase()] = matchSingular({
            arg, prefix, bracket, argName: name, commandName, repeating: false, rangeFrom, rangeTo,
            client, guild
        });
    }

    return parsed;
}

// Converts a `CommandInteractionOption[]` from a `CommandInteraction` into an argParser object.
export function parseSlashCommandArgs(options: readonly CommandInteractionOption[]) {
    const parsed: any = {};
    for (const option of options) {
        const type = option.type;
        parsed[option.name] =
            type === ApplicationCommandOptionType.User ? option.user
            : type === ApplicationCommandOptionType.Channel ? option.channel
            : type === ApplicationCommandOptionType.Role ? option.role
            : option.value
    }
    return parsed;
}


type FieldProps = {
    arg: string, prefix: string, bracket: string, rangeFrom?: string, rangeTo?: string,
    argName: string, commandName: string, repeating: boolean,
    client: Client, guild: Guild | null
}
function matchSingular(props: FieldProps) {
    const {arg, prefix, bracket, argName, commandName, repeating, rangeFrom, rangeTo, client, guild} = props;

    if (bracket === '(') return parseIntegerArg(arg, commandName, argName, rangeFrom, rangeTo, repeating);
    if (bracket === '{') return parseDurationArg(arg, commandName, argName, repeating);

    switch (prefix) {
        case '@': return parseUserArg(arg, commandName, argName, client, repeating);
        case '#': return parseChannelArg(arg, commandName, argName, client, repeating);
        case '&': return parseRoleArg(arg, commandName, argName, guild, repeating);
        case ':': return parseEmojiArg(arg, commandName, argName, client, repeating);
        default: return arg;
    }
}

// Parses a string argument as an integer, erroring if the argument is not a number or if it isn't an integer.
// Returns the parsed integer as a `number`.
export function parseIntegerArg(arg: string, commandName: string, argName: string, rangeFrom?: string, rangeTo?: string, repeating?: boolean) {
    const num = Number(arg);
    if (isNaN(num) || num % 1 !== 0)
        throw new IntegerConversionError(commandName, argName, repeating);
    if (rangeFrom && rangeTo && (num < Number(rangeFrom) || num > Number(rangeTo)))
        throw new IntegerRangeError(commandName, argName, rangeFrom, rangeTo, repeating);
    return num;
}

// Parses a string argument as a `User`, erroring if the argument is not a user mention or id.
// Returns the parsed `User`.
export function parseUserArg(arg: string, commandName: string, argName: string, client: Client, repeating?: boolean) {
    const userID = arg.match(mentionRegex)?.[1] ?? arg;
    const user = client.users.cache.get(userID);
    if (!user) throw new UserConversionError(commandName, argName, repeating);
    return user;
}

// Parses a string argument as a `Channel`, erroring if the argument is not a channel mention or id.
// Returns the parsed `Channel`.
export function parseChannelArg(arg: string, commandName: string, argName: string, client: Client, repeating?: boolean) {
    const channelID = arg.match(channelRegex)?.[1] ?? arg;
    const channel = client.channels.cache.get(channelID);
    if (!channel) throw new ChannelConversionError(commandName, argName, repeating);
    return channel;
}

// Parses a string argument as a `Role`, erroring if the argument is not a role mention or id.
// Returns the parsed `Role`.
export function parseRoleArg(arg: string, commandName: string, argName: string, guild: Guild | null, repeating?: boolean) {
    if (!guild) return;
    const roleID = arg.match(roleRegex)?.[1] ?? arg;
    const role = guild.roles.cache.get(roleID);
    if (!role) throw new RoleConversionError(commandName, argName, repeating);
    return role;
}

// Parses a string argument as a `GuildEmoji`, erroring if the argument is not an emoji or emoji id.
// Returns the parsed `GuildEmoji`.
export function parseEmojiArg(arg: string, commandName: string, argName: string, client: Client, repeating?: boolean) {
    const emojiID = arg.match(emojiRegex)?.[1] ?? arg;
    const emoji = client.emojis.cache.get(emojiID);
    if (!emoji) throw new EmojiConversionError(commandName, argName, repeating);
    return emoji;
}

// Parses a string argument as a duration, matching it against the `timeRegex` and erroring if the match failed.
// Returns the duration, in milliseconds, as a `number`.
export function parseDurationArg(arg: string, commandName: string, argName: string, repeating?: boolean) {
    const match = arg.match(timeRegex);
    if (!match?.[0]) throw new DurationConversionError(commandName, argName, repeating);
    const [, days, hours, minutes, seconds] = match;
    return Number(days ?? 0) * 1000 * 60 * 60 * 24
        + Number(hours ?? 0) * 1000 * 60 * 60
        + Number(minutes ?? 0) * 1000 * 60
        + Number(seconds ?? 0) * 1000
}
