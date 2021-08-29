import {Message, MessageEmbed, User} from 'discord.js';

export default {
    name: 'avatar',
    aliases: ['icon', 'pfp'],
    description: 'Fetches the discord avatar of the specified user, or yourself if no user was given.',
    pattern: '@[Target]?',
    examples: 'avatar @RBot',
    execute(message: Message, parsed: {target: User}) {
        const avatarTarget = parsed.target ?? message.author;
        const avatarEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(avatarTarget.username)
            .setImage(avatarTarget.displayAvatarURL({size: 4096, dynamic: true, format: 'png'}))
            .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send({embeds: [avatarEmbed]});
    }
}
