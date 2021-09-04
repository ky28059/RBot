import {CommandInteraction, Message, MessageEmbed, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {author, reply} from '../../utils/messageUtils';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Fetches information about the specified user, or yourself if no user was given.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get info about')),
    guildOnly: true,
    async execute(message: Message | CommandInteraction, parsed: {target?: User}) {
        // TODO: make prettier, add functionality
        const profileTarget = parsed.target || author(message);
        const guildProfileTarget = message.guild!.members.cache.get(profileTarget.id)!;

        const profileEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setAuthor(`\u200b${profileTarget.tag}`, profileTarget.displayAvatarURL({format: 'png'}))
            .addFields(
                {name: 'Account created on', value: `\u200b${profileTarget.createdAt}`},
                {name: 'Server joined on', value: `\u200b${guildProfileTarget.joinedAt}`},
            )
            .setFooter(`Requested by ${author(message).tag}`);
        await reply(message, {embeds: [profileEmbed]});
    }
}
