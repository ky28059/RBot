// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import {success} from '../../utils/messages.js';


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

        if (!count)
            throw new IllegalArgumentError(this.name, '`Count` must be a valid integer');
        if (count < 1 || count > 100)
            throw new IllegalArgumentError(this.name, '`Count` must be between 1 and 100');

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
