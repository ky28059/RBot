// Splitting string to array and then using methods on it should be more reliable than string methods;
// 'hackban'.includes('ban') would be true for instance, creating an error in the code, whereas
// ['hackban'].includes('ban') would be false as expected
// Obviously, storing token data as arrays would be the most ideal, but I don't think sequelize supports that, so this will do for now


// Updating tags

// Update a tag by either creating it if it doesn't exist or running checks on it if it does
export async function update(guild, client) {
    const tag = await client.GuildTags.findOne({ where: { guildID: guild.id } });

    if (!tag) {
        // If the tag doesn't exist
        const tag = await client.GuildTags.create({
            guildID: guild.id,
        });
        return console.log(`Tag ${tag.guildID} added.`);
    }

    // If the tag exists, run checks on it
    // Since update() gets called on every message, this may get tedious
    await runTagChecks(tag, guild, client);
}

// Run tag checks to ensure token cleanliness
async function runTagChecks(tag, guild, client) {
    const warn = (message) => console.error(`Token error in Guild ${guild} (${guild.id}): ${message}`);

    // Check if all disabled commands are actual existing commands
    if (tag.disabled_commands) {
        tag.disabled_commands.split(' ').forEach(disabled => {
            // Probably better way of doing this
            const command = client.commands.get(disabled)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(disabled));

            if (!command) warn('Malformed disabled commands');
        })
    }

    // Check if channel fields have become invalid since their setting and reset if they have
    for (let field of ['logchannel']) { // List of channel dependent fields
        if (tag[field]) {
            const channel = client.channels.cache.get(tag[field]);
            if (!channel) {
                warn(`Invalid ${field} - resetting field`);
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
export function isInField(tag, field, query, joiner) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    const keys = tag[field].split(joiner ?? ' ');

    if (Array.isArray(query)) {
        // If query is an array, check queries to see if any words are included in key
        return query.some(q => keys.includes(q));
    } else {
        // Else, check if query is included in key
        return keys.includes(query);
    }
}

// Checks whether an argument contains a given tag field
export function containsField(tag, field, query, joiner) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    const keys = tag[field].split(joiner ?? ' ');

    if (Array.isArray(query)) {
        // If query is an array, check every key against every query
        return keys.some(key => query.some(q => q.includes(key)));
    } else {
        // Else, check every key against query
        return keys.some(key => query.includes(key));
    }
}

// Adds the given argument to a tag field
export async function addToField(tag, field, additions, joiner) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    let keys; // Better way of doing this?
    if (tag[field]) { // To prevent the default '' from being added to the array
        keys = tag[field].split(' ');
    } else {
        keys = [];
    }

    if (Array.isArray(additions)) {
        // If additions is an array, merge the arrays
        keys = keys.concat(additions);
    } else {
        // Otherwise, push the singular element to the array
        keys.push(additions);
    }

    tag[field] = keys.join(joiner ?? ' ');
    await tag.save();
}

// Removes the given argument from a tag field
export async function removeFromField(tag, field, removals, joiner) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on on string field!');

    let keys;
    if (tag[field]) { // To prevent the default '' from being added to the array
        keys = tag[field].split(joiner ?? ' ');
    } else {
        keys = [];
    }

    let filter;
    if (Array.isArray(removals)) {
        // If removals is an array, check keys against the array to see if they should be filtered
        filter = key => !removals.includes(key);
    } else {
        // Otherwise, check key against the element to see if it should be filtered
        filter = key => key !== removals;
    }

    tag[field] = keys.filter(filter).join(' ');
    await tag.save();
}
