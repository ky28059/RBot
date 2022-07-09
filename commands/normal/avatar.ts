import {SlashCommand} from '../../utils/parseCommands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {author, replyEmbed} from '../../utils/messageUtils';
import {requestedBy} from '../../utils/messages';


const command: SlashCommand<{user?: User}> = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Fetches the discord avatar of the specified user, or yourself if no user was given.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to get the avatar of.')),
    async execute(message, parsed) {
        const avatarTarget = parsed.user ?? author(message);
        const avatarEmbed = requestedBy(author(message))
            .setTitle(avatarTarget.username)
            .setImage(avatarTarget.displayAvatarURL({size: 4096, dynamic: true, format: 'png'}));
        await replyEmbed(message, avatarEmbed);
    }
}

export default command;
