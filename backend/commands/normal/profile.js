import {MessageEmbed} from 'discord.js';

export default {
    name: 'profile',
    description: 'Fetches information about the specified user, or yourself if no user was given.',
    pattern: '@[Target]?',
    examples: 'profile @RBot',
    guildOnly: true,
    execute(message, parsed) {
        // TODO: make prettier, add functionality
        const profileTarget = parsed.target || message.author;
        const guildProfileTarget = message.guild.member(profileTarget);

        const profileEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setAuthor(`\u200b${profileTarget.tag}`, profileTarget.avatarURL())
            .addFields(
                {name: 'Account created on', value: `\u200b${profileTarget.createdAt}`},
                {name: 'Server joined on', value: `\u200b${guildProfileTarget.joinedAt}`},
            )
            .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(profileEmbed);
    }
}
