/*
    An argument parser to match message portions to argument patterns, somewhat inspired by HarVM's simpleArgumentParser.

    Parser Syntax:
    [field] = String field
    [field]? = Optional field
    @[user] = Mention field
    #[channel] = Channel field
    &[role] = Role field
    <rest> = Rest of the arguments, as a string

    Examples (argString, pattern => result):
    "add @role", "[action] &[role]"
        => { action: "add", role: <@&798308691443056672> }
    "something other else", "[field] [field2] [field3]?"
        => { field: "something", field2: "other", field3: "else" }
    "something other", "[field] [field2] [field3]?"
        => { field: "something", field2: "other" }
    "something", "[field] [field2] [field3]?"
        => MissingArgumentError
    "something other else", "<message>"
        => { message: "something other else" }
*/

import MissingArgumentError from '../errors/MissingArgumentError.js';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';


// Regexes to get ID from mention (<@!someid> => someid)
const mentionRegex = /^<@!?(\d+)>$/;
const channelRegex = /^<#(\d+)>$/;
const roleRegex = /^<@&(\d+)>$/;


export default function parse(argString, command, client, guild) {
    const returnObj = {};
    const patterns = command.pattern.split(' ');

    // Split by spaces, but preserve sequences with spaces that are enclosed in quotes
    // Regex taken from HarVM
    const args = argString.match(/("(?:[^"\\]|\\.)*")|[^\s]+/g).map(x => x.replace(/"/g, '')); // Lazily remove quotes from quote enclosed args

    // Go down the queue of args and attempt to match 1:1 to patterns
    for (let i = 0; i < patterns.length; i++) {

        const pattern = patterns[i].match(/^(?<prefix>[@#&]?)(?<bracket>[<\[])(?<name>\w+)[\]>](?<optional>\??)$/).groups;
        const name = pattern.name;
        const bracket = pattern.bracket;
        const prefix = pattern.prefix;
        const optional = pattern.optional;

        const arg = args.shift();
        if (!arg && !optional) throw new MissingArgumentError(command.name, name); // Throw MissingArgumentError when a required argument is not found

        let match;
        if (prefix) {
            switch (prefix) {
                case '@': // Users
                    let userID = arg.match(mentionRegex) ? arg.match(mentionRegex)[1] : arg;

                    let user = client.users.cache.get(userID);
                    if (!user) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid user`);
                    match = user;
                    break;
                case '#': // Channels
                    let channelID = arg.match(channelRegex) ? arg.match(channelRegex)[1] : arg;

                    let channel = client.channels.cache.get(channelID);
                    if (!channel) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid channel`);
                    match = channel;
                    break;
                case '&': // Roles
                    let roleID = arg.match(roleRegex) ? arg.match(roleRegex)[1] : arg;

                    let role = guild.roles.cache.get(roleID);
                    if (!role) throw new IllegalArgumentError(command.name, `Field \`${name}\` must be a valid role`);
                    match = role;
                    break;
            }
        } else {
            switch (bracket) {
                case '[':
                    match = arg;
                    break;
                case '<':
                    args.unshift(arg); // Add arg back into the array
                    match = args.join(' ');
                    break;
            }
        }
        returnObj[name.toLowerCase()] = match;
    }
    return returnObj;
}