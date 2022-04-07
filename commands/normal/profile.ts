import {CommandInteraction, Message, MessageEmbed, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {requestedBy} from "../../utils/messages";


export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Fetches information about the specified user, or yourself if no user was given.')
        .addUserOption(option => option
            .setName('target')
            .setDescription('The user to get info about')),
    guildOnly: true,
    async execute(message: Message | CommandInteraction, parsed: {target?: User}) {
        // TODO: make prettier, add functionality
        const profileTarget = parsed.target || author(message);
        const guildProfileTarget = message.guild!.members.cache.get(profileTarget.id)!;

        const profileEmbed = requestedBy(author(message))
            .setAuthor({name: profileTarget.tag, iconURL: profileTarget.displayAvatarURL({format: 'png'})})
            .addFields(
                {name: 'Account created on', value: profileTarget.createdAt.toISOString()},
                {name: 'Server joined on', value: guildProfileTarget.joinedAt?.toISOString() ?? 'Unknown'},
            );
        await replyEmbed(message, profileEmbed);
    }
}
