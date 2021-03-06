// Errors
import IntegerConversionError from '../../errors/IntegerConversionError.js';
import IntegerRangeError from '../../errors/IntegerRangeError.js';


export default {
    name: 'expunge',
    description: 'Removes all reactions from the specified amount of messages in the channel.',
    pattern: '[Count]',
    examples: 'expunge 80',
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        let count = Number(parsed.count);

        if (isNaN(count) || count % 1 !== 0)
            throw new IntegerConversionError(this.name, 'Count');
        if (count < 1 || count > 100)
            throw new IntegerRangeError(this.name, 'Count', 1, 100);

        const fetched = await message.channel.messages.fetch({limit: count + 1});
        fetched.array().forEach(message =>
            message.reactions.cache.array().length > 0
                ? message.reactions.removeAll()
                : null
        );
        await message.react('👌');
    }
}
