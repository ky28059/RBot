// Splitting string to array and then using methods on it should be more reliable than string methods;
// 'hackban'.includes('ban') would be true for instance, creating an error in the code, whereas
// ['hackban'].includes('ban') would be false as expected
// Obviously, storing token data as arrays would be the most ideal, but I don't think sequelize supports that, so this will do for now


// Updating tags
export async function update(guild, client) {
    const tag = await client.Tags.findOne({ where: { guildID: guild.id } });

    if (!tag) {
        // If the tag doesn't exist
        const tag = await client.Tags.create({
            guildID: guild.id,
        });
        return console.log(`Tag ${tag.guildID} added.`);
    }

    // If the tag exists, run checks on it
    // Since update() gets called on every message, this may get tedious
    runTagChecks(tag, guild, client);
}

function runTagChecks(tag, guild, client) {
    // Check if all disabled commands are actual existing commands
    if (tag.disabled_commands) {
        tag.disabled_commands.split(' ').forEach(disabled => {
            // Probably better way of doing this
            const command = client.commands.get(disabled)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(disabled));

            if (!command) console.error(`Guild ${guild} (${guild.id}) found with malformed disabled commands: [${disabled}] is not a valid command!`);
        })
    }

    // TODO: add checks for user centric fields such as censored_users or blacklist
    // and also role centric fields such as autorole
}


// Modifying / checking against string tags
export function isInField(tag, field, query) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on non string field!');

    const keys = tag[field].split(' ');

    if (Array.isArray(query)) {
        // If query is an array, filter query to see if any words are included in key
        return query.filter(q => keys.includes(q)).length ? true : false;
    } else {
        // Else, check if query is included in key
        return keys.includes(query);
    }
}

export async function addToField(tag, field, additions) {
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

    tag[field] = keys.join(' ');
    await tag.save();
}

export async function removeFromField(tag, field, removals) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on on string field!');

    let keys;
    if (tag[field]) { // To prevent the default '' from being added to the array
        keys = tag[field].split(' ');
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
