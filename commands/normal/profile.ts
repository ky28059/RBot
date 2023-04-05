import {createGuildOnlySlashCommand} from '../../util/commands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {author, replyEmbed} from '../../util/messageUtils';
import {requestedBy} from '../../util/messages';


export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Fetches information about the specified user, or yourself if no user was given.')
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('target')
        .setDescription('The user to get info about.'))

export default createGuildOnlySlashCommand<{target?: User}>({
    data,
    async execute(message, parsed) {
        const target = parsed.target ?? author(message);
        const member = message.guild!.members.cache.get(target.id)!;

        const profileEmbed = requestedBy(author(message))
            .setColor(member.displayHexColor)
            .setAuthor({name: target.tag, iconURL: target.displayAvatarURL()})
            .addFields({name: 'Account created:', value: `<t:${Math.floor(target.createdTimestamp / 1000)}>`, inline: true})
        if (member.joinedTimestamp)
            profileEmbed.addFields({name: 'Server joined:', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}>`, inline: true});
        if (member.premiumSinceTimestamp)
            profileEmbed.addFields({name: 'Boosting since:', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}>`, inline: true});
        profileEmbed.addFields({name: 'Roles:', value: [...member.roles.cache.values()].join(' ')});

        await replyEmbed(message, profileEmbed);
    }
});
