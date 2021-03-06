import {success} from '../../utils/messages.js';

// Errors
import IntegerConversionError from '../../errors/IntegerConversionError.js';
import IntegerRangeError from '../../errors/IntegerRangeError.js';


export default {
    name: 'purge',
    description: 'Bulk deletes the specified amount of messages in the channel, or if a user is given only messages sent by that user.',
    pattern: '[Count] @[Target]?',
    examples: ['purge 80', 'purge 80 @RBot'],
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        let count = Number(parsed.count);

        if (isNaN(count) || count % 1 !== 0)
            throw new IntegerConversionError(this.name, 'Count');
        if (count < 1 || count > 100)
            throw new IntegerRangeError(this.name, 'Count', 1, 100);

        // Delete the original message so that more messages can be bulk deleted
        await message.delete()

        let fetched = await message.channel.messages.fetch({limit: count});

        // Support purge by user
        if (parsed.target)
            fetched = fetched.filter(message => message.author.id === parsed.target.id);

        await message.channel.bulkDelete(fetched)
        await message.channel.send(success({desc: `Purged ${count} messages`}))
    }
}
