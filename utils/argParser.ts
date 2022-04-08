import {Client, Guild} from 'discord.js';
import {Command} from './parseCommands';

import MissingArgumentError from '../errors/MissingArgumentError';
import IllegalArgumentError from '../errors/IllegalArgumentError';
import NumberConversionError from '../errors/NumberConversionError';
import IntegerRangeError from "../errors/IntegerRangeError";
import IntegerConversionError from "../errors/IntegerConversionError";


// Regexes to get ID from mention (<@!someid> => someid)
const mentionRegex = /^<@!?(\d+)>$/;
const channelRegex = /^<#(\d+)>$/;
const roleRegex = /^<@&(\d+)>$/;


/*
    An argument parser to match message portions to argument patterns, somewhat inspired by HarVM's simpleArgumentParser.
    The string-based argParser pattern syntax is as follows:

    Types:
    [field] = String field
    (field) = Integer field
    @[user] = User field
    #[channel] = Channel field
    &[role] = Role field
    <rest> = Rest of the arguments, as a string

    Modifiers:
    [field]? = Optional -- matches if it exists, retuning undefined if it does not
    [...field] = Repeating field -- attempts to match the rest of the arguments as this field, returning the result as an array
    (field)[a-b] = Integer range -- matches an integer within the given inclusive range from a to b, throws an error otherwise

    Examples (argString, pattern => result):
    "add @role", "[action] &[role]"
        => { action: "add", role: Discord.Role }
    "something other else", "[field] [field2] [field3]?"
        => { field: "something", field2: "other", field3: "else" }
    "something other", "[field] [field2] [field3]?"
        => { field: "something", field2: "other" }
    "something other", "[field] [field2] [field3]"
        => MissingArgumentError
    "something other else", "<message>"
        => { message: "something other else" }
    "one two three", "[...numbers]"
        => { numbers: ["one", "two", "three"] }
    "@user @otheruser @thirduser", "@[...people]"
        => { people: [User, User, User] }

    TODO: add syntax for commands that can have multiple patterns
    Commands whose arguments can be one of multiple patterns: set, censor, uncensor, technically roll would benefit from it as well
*/
export default function parse(argString: string, command: Command, client: Client, guild: Guild | null) {
    const returnObj: any = {};
    let index = 0; // Current index in the string for <Rest> patterns

    // Get argument patterns if they exist, return if the command takes in no arguments or if patterns are missing
    if (!command.pattern) return;
    const patterns = command.pattern.split(' ');

    // Split by spaces, but preserve sequences with spaces that are enclosed in quotes
    // Regex taken from HarVM
    const args = argString.match(/("(?:[^"\\]|\\.)*")|[^\s]+/g);

    // Go down the queue of args and attempt to match 1:1 to patterns
    for (let i = 0; i < patterns.length; i++) {

        const pattern = patterns[i].match(/^(?<prefix>[@#&]?)(?<bracket>[<\[(])(?<repeating>(?:\.{3})?)(?<name>\w+)[)\]>](?:\[(?<rangeFrom>\d+)-(?<rangeTo>\d+)])?(?<optional>\??)$/)!;
        // @ts-ignore
        const { name, bracket, prefix, repeating, optional, rangeFrom, rangeTo } = pattern.groups;

        // If no args were provided, or if none remain
        if (!args || !args.length) {
            // Throw MissingArgumentError if a required argument is not found
            if (!optional) throw new MissingArgumentError(command.name, name);
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
                console.warn(`Bad pattern in ${command.name}, field <${name}> cannot be repeating`);
            if (prefix)
                console.warn(`Bad pattern in ${command.name}, field <${name}> cannot have a prefix`);
            if (i !== patterns.length - 1)
                console.warn(`Bad pattern in ${command.name}, field <${name}> is not the last field`);

            returnObj[name.toLowerCase()] = argString.substring(index - arg.length);

            return returnObj;
        }

        // If repeating, match remaining args and return
        if (repeating) {
            // Check for bad patterns
            if (i !== patterns.length - 1)
                console.warn(`Bad pattern in ${command.name}, repeating field ${name} is not the last field`);

            args.unshift(arg)
            returnObj[name.toLowerCase()] = args
                .map(arg => arg.replace(/^"|"$/g, '')) // Sanitize quotes
                .map(arg => matchSingular({
                    arg, prefix, bracket, name, rangeFrom, rangeTo, client, guild, command
                }));

            return returnObj;
        }

        // Otherwise, match arg based on prefix
        arg = arg.replace(/^"|"$/g, ''); // Sanitize quotes
        returnObj[name.toLowerCase()] = matchSingular({
            arg, prefix, bracket, name, rangeFrom, rangeTo, client, guild, command
        });
    }

    return returnObj;
}

type FieldProps = {
    arg: string, prefix: string, bracket: string, name: string, rangeFrom?: string, rangeTo?: string,
    client: Client, guild: Guild | null, command: Command
}
function matchSingular({arg, prefix, bracket, name, rangeFrom, rangeTo, client, guild, command}: FieldProps) {
    if (bracket === '(') { // Integers
        const num = Number(arg);
        if (isNaN(num) || num % 1 !== 0)
            throw new IntegerConversionError(command.name, name);
        if (rangeFrom && rangeTo && (num < Number(rangeFrom) || num > Number(rangeTo)))
            throw new IntegerRangeError(command.name, name, rangeFrom, rangeTo);
        return num;
    }

    switch (prefix) {
        case '@': // Users
            const userID = arg.match(mentionRegex)?.[1] ?? arg;
            const user = client.users.cache.get(userID);
            if (!user) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid user.`);
            return user;

        case '#': // Channels
            const channelID = arg.match(channelRegex)?.[1] ?? arg;
            const channel = client.channels.cache.get(channelID);
            if (!channel) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid channel.`);
            return channel;

        case '&': // Roles
            if (!guild) return;
            const roleID = arg.match(roleRegex)?.[1] ?? arg;
            const role = guild.roles.cache.get(roleID);
            if (!role) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid role.`);
            return role;

        default: // Default string field
            return arg;
    }
}
