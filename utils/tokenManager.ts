// Splitting string to array and then using methods on it should be more reliable than string methods;
// 'hackban'.includes('ban') would be true for instance, creating an error in the code, whereas
// ['hackban'].includes('ban') would be false as expected
// Obviously, storing token data as arrays would be the most ideal, but I don't think sequelize supports that, so this will do for now

import {Client, Guild} from 'discord.js';
import {Guild as GuildPresets} from '../models/Guild';


// Updating tags

// Update a tag by either creating it if it doesn't exist or running checks on it if it does

export async function update(guild: Guild, client: Client) {
    const tag = await GuildPresets.findOne({ where: { guildID: guild.id } });

    if (!tag) {
        // If the tag doesn't exist
        const tag = await GuildPresets.create({
            guildID: guild.id,
        });
        return console.log(`Tag ${tag.guildID} added.`);
    }

    // If the tag exists, run checks on it
    // Since update() gets called on every message, this may get tedious
    await runTagChecks(tag, guild, client);
}

// Run tag checks to ensure token cleanliness
async function runTagChecks(tag: GuildPresets, guild: Guild, client: Client) {
    const warn = (message: string) => console.error(`Token error in Guild ${guild} (${guild.id}): ${message}`);

    // Check if all disabled commands are actual existing commands
    if (tag.disabled_commands) {
        tag.disabled_commands.split(' ').forEach(disabled => {
            // Probably better way of doing this
            const command = client.commands.get(disabled)
                || client.commands.find(cmd => !!cmd.aliases && cmd.aliases.includes(disabled));

            if (!command) warn('Malformed disabled commands');
        })
    }

    // Check if channel fields have become invalid since their setting and reset if they have
    for (let field of ['logchannel']) { // List of channel dependent fields
        // @ts-ignore
        if (tag[field]) {
            // @ts-ignore
            const channel = client.channels.cache.get(tag[field]);
            if (!channel) {
                warn(`Invalid ${field} - resetting field`);
                // @ts-ignore
                tag[field] = '';
            }
        }
    }

    // TODO: add checks for user centric fields such as censored_users or blacklist
    // and also role centric fields such as autorole
    await tag.save();
}


// Modifying / checking against string tags

// Checks whether an argument is contained by a given tag field
export function isInField(tag: GuildPresets, field: keyof GuildPresets, query?: string | string[], joiner?: string) {
    const value = tag[field];
    if (typeof value !== 'string')
        return console.error('Attempted to run string field function on non string field!');
    if (!query) return false;

    const keys = value.split(joiner ?? ' ');

    return Array.isArray(query)
        // If query is an array, check queries to see if any words are included in key
        ? query.some(q => keys.includes(q))
        // Else, check if query is included in key
        : keys.includes(query)
}

// Checks whether an argument contains a given tag field
export function containsField(tag: GuildPresets, field: keyof GuildPresets, query?: string | string[], joiner?: string) {
    const value = tag[field];
    if (typeof value !== 'string')
        return console.error('Attempted to run string field function on non string field!');
    if (!query) return false;

    const keys = value.split(joiner ?? ' ');

    return Array.isArray(query)
        // If query is an array, check every key against every query
        ? keys.some(key => query.some(q => q.includes(key)))
        // Else, check every key against query
        : keys.some(key => query.includes(key))
}

// Adds the given argument to a tag field
export async function addToField(tag: GuildPresets, field: keyof GuildPresets, additions: string | string[], joiner?: string) {
    const value = tag[field];
    if (typeof value !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    let keys = value ? value.split(joiner ?? ' ') : [];

    if (Array.isArray(additions)) {
        // If additions is an array, merge the arrays
        keys = keys.concat(additions);
    } else {
        // Otherwise, push the singular element to the array
        keys.push(additions);
    }

    // @ts-ignore
    tag[field] = keys.join(joiner ?? ' ');
    await tag.save();
}

// Removes the given argument from a tag field
export async function removeFromField(tag: GuildPresets, field: keyof GuildPresets, removals: string | string[], joiner?: string) {
    const value = tag[field];
    if (typeof value !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    let keys = value ? value.split(joiner ?? ' ') : [];

    let filter = Array.isArray(removals)
        // If removals is an array, check keys against the array to see if they should be filtered
        ? (key: string) => !removals.includes(key)
        // Otherwise, check key against the element to see if it should be filtered
        : (key: string) => key !== removals

    // @ts-ignore
    tag[field] = keys.filter(filter).join(joiner ?? ' ');
    await tag.save();
}