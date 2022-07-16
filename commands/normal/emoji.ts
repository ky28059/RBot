import {createSlashCommand} from '../../utils/commands';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utils
import {parseEmojiArg} from '../../utils/argParser';
import {author, replyEmbed} from '../../utils/messageUtils';
import {requestedBy} from '../../utils/messages';


export const data = new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Gets info about the requested emoji.')
    .addStringOption(option => option
        .setName('emoji')
        .setDescription('The emoji to get info about.')
        .setRequired(true))

export default createSlashCommand<{emoji: string}>({
    data,
    examples: 'emoji 762731625498542091',
    async execute(message, parsed) {
        const emoji = parseEmojiArg(parsed.emoji, 'emoji', 'emoji', message.client);

        const emojiEmbed = requestedBy(author(message))
            .setTitle(emoji.name!)
            .setThumbnail(emoji.url)

        if (emoji.author) emojiEmbed.addField('Created by:', emoji.author.toString());
        emojiEmbed
            .addField('Created at:', `<t:${Math.floor(emoji.createdTimestamp / 1000)}>`)
            .addField('Guild:', emoji.guild.name, true)
            .addField('Animated:', emoji.animated ? 'true' : 'false', true)
            .addField('Available:', emoji.available ? 'true' : 'false', true)

        await replyEmbed(message, emojiEmbed);
    }
});
