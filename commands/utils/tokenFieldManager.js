// Splitting string to array and then using methods on it should be more reliable than string methods;
// 'hackban'.includes('ban') would be true for instance, creating an error in the code, whereas
// ['hackban'].includes('ban') would be false as expected
// Obviously, storing token data as arrays would be the most ideal, but I don't think sequelize supports that, so this will do for now


export function isInField(tag, field, query) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on on string field!');

    const keys = tag[field].split(' ');
    return keys.includes(query);
}

export async function addToField(tag, field, additions) {
    if (typeof tag[field] !== 'string')
        return console.error('Attempted to run string field function on on string field!');

    let keys = tag[field].split(' ');
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

    let keys = tag[field].split(' ');
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
