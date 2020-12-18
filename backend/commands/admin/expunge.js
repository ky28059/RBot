// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'expunge',
    description: 'Removes all reactions from the specified amount of messages in the channel.',
    usage: 'expunge [1-99]',
    examples: 'expunge 80',
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        let expungeCount = Number(parsed.first);

        if (!expungeCount)
            throw new MissingArgumentError(this.name, 'Count')
        if (expungeCount < 1 || expungeCount > 100)
            throw new IllegalArgumentError(this.name, '`Count` must be an integer between 1 and 100');

        const fetched = await message.channel.messages.fetch({limit: expungeCount + 1});
        fetched.array().forEach(message =>
            message.reactions.cache.array().length > 0
                ? message.reactions.removeAll()
                : null
        );
        await message.react('👌');
    }
}
