import {Message, CommandInteraction, MessageEmbed, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {author, reply} from '../../utils/messageUtils';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Fetches the discord avatar of the specified user, or yourself if no user was given.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the avatar of')),
    async execute(message: Message | CommandInteraction, parsed: {user?: User}) {
        const avatarTarget = parsed.user ?? author(message);
        const avatarEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(avatarTarget.username)
            .setImage(avatarTarget.displayAvatarURL({size: 4096, dynamic: true, format: 'png'}))
            .setFooter(`Requested by ${author(message).tag}`);
        await reply(message, {embeds: [avatarEmbed]});
    }
}
