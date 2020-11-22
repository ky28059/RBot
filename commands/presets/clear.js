export default {
    name: 'clear',
    description: 'Clear this server\'s token.',
    usage: 'clear',
    examples: 'clear',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client) {
        const guild = message.guild;

        // Make users confirm token flush before proceding
        const confirmMessage =
            await message.channel.send('You are about to flush this server\'s token. ' +
            'All fields will be reset to their default states. Proceed?');
        await confirmMessage.react('👍');
        await confirmMessage.react('👎');

        const filter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;

        confirmMessage.awaitReactions(filter, { max: 1, time: 30000 })
            .then(collected => {
                switch (collected.first().emoji.name) {
                    case '👍':
                        confirmMessage.edit('Confirmed! Resetting fields...');

                        client.GuildTags.findOne({ where: { guildID: guild.id } }).then(tag => {
                            // Destroy the old token
                            tag.destroy();
                        })/* .then(() => {
                            // Regenerate the token
                            client.Tags.create({ guildID: guild.id });
                        }); */

                        // The regeneration part of that code gives sequelize validation error
                        // But the command still works for now, since guilds that are missing tokens are automatically generated one on message
                        // Ideally though, this command should generate its own

                        message.channel.send(`Server token regenerated!`);
                        break;
                    case '👎':
                        confirmMessage.edit('Reset aborted.');
                        break;
                }
            }).catch(() => {
                confirmMessage.edit('No response after 30 seconds, cancelling...');
            });
    }
}