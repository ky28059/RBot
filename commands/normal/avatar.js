import {MessageEmbed} from 'discord.js';

export default {
    name: 'avatar',
    aliases: ['icon', 'pfp'],
    description: 'Fetches the discord avatar of the specified user.',
    usage: 'avatar @[user]',
    execute(message, parsed) {
        const avatarTarget = parsed.userTarget || message.author;
        const avatarEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(avatarTarget.username)
            .setImage(avatarTarget.avatarURL({size: 4096, dynamic: true, format: 'png'}))
            .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(avatarEmbed);
    }
}
