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

        if (emoji.author) emojiEmbed.addFields({name: 'Created by:', value: emoji.author.toString()});
        emojiEmbed.addFields(
            {name: 'Created at:', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}>`},
            {name: 'Guild:', value: emoji.guild.name, inline: true},
            {name: 'Animated:', value: emoji.animated ? 'true' : 'false', inline: true},
            {name: 'Available:', value: emoji.available ? 'true' : 'false', inline: true}
        );

        await replyEmbed(message, emojiEmbed);
    }
});
