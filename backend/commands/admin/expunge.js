// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


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

        if (!count)
            throw new IllegalArgumentError(this.name, '`Count` must be a valid integer');
        if (count < 1 || count > 100)
            throw new IllegalArgumentError(this.name, '`Count` must be between 1 and 100');

        const fetched = await message.channel.messages.fetch({limit: count + 1});
        fetched.array().forEach(message =>
            message.reactions.cache.array().length > 0
                ? message.reactions.removeAll()
                : null
        );
        await message.react('👌');
    }
}
