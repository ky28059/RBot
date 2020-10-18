export default {
    name: 'purge',
    description: 'Bulk deletes the specified amount of messages in the channel.',
    usage: 'purge [1-99]',
    examples: 'purge 80',
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        let deleteCount = Number(parsed.first);
        if (!deleteCount || deleteCount < 1 || deleteCount > 99) return message.reply("please provide a number between 1 and 99 for the number of messages to delete");

        const fetched = await message.channel.messages.fetch({limit: deleteCount + 1});
        message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`couldn't delete messages because of: ${error}`));
    }
}
