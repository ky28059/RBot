// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'purge',
    description: 'Bulk deletes the specified amount of messages in the channel.',
    usage: ['purge [1-99]', 'purge [1-99] @[user]'],
    examples: ['purge 80', 'purge 80 @RBot'],
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        let deleteCount = Number(parsed.first);

        if (!deleteCount)
            throw new MissingArgumentError(this.name, 'Count')
        if (deleteCount < 1 || deleteCount > 100)
            throw new IllegalArgumentError(this.name, '`Count` must be an integer between 1 and 100');

        // Delete the original message so that more messages can be bulk deleted
        await message.delete()

        let fetched = await message.channel.messages.fetch({limit: deleteCount});
        if (parsed.memberTarget) // Supports purge by user
            fetched = fetched.filter(message => message.author.id === parsed.memberTarget.id);

        await message.channel.bulkDelete(fetched)
    }
}
