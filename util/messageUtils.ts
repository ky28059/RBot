import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction,
    EmbedBuilder, Message, MessageCreateOptions
} from 'discord.js';
import {err} from './messages';


/**
 * Replies to a message or interaction.
 * @param target - The `Message` or `CommandInteraction` to reply to.
 * @param content - The content to reply to the target with. Either a text string or an object of message options.
 */
export async function reply(target: Message | CommandInteraction, content: string | Omit<MessageCreateOptions, 'flags'>) {
    // TODO: `options.flags` are incompatible between messages and command interactions;
    // is there any fix beyond disallowing this property?
    return target instanceof CommandInteraction
        ? target.reply({...(typeof content === 'string' ? {content} : content), fetchReply: true})
        : target.channel.send(content);
}

/**
 * Replies to a message or deferred interaction. See {@link reply}.
 * @param target - The `Message` or `CommandInteraction` to reply to.
 * @param content - The content to reply to the target with.
 */
export async function deferredReply(target: Message | CommandInteraction, content: string | Omit<MessageCreateOptions, 'flags'>) {
    return target instanceof CommandInteraction
        ? target.editReply({...(typeof content === 'string' ? {content} : content)})
        : target.channel.send(content);
}

/**
 * Replies to a message or interaction with the given embed.
 * @param target - The `Message` or `CommandInteraction` to reply to.
 * @param embed - The message embed to reply with.
 */
export async function replyEmbed(target: Message | CommandInteraction, embed: EmbedBuilder) {
    return reply(target, {embeds: [embed]});
}

/**
 * Replies to a message or deferred interaction with the given embed. See {@link replyEmbed}.
 * @param target - The `Message` or `CommandInteraction` to reply to.
 * @param embed - The message embed to reply with.
 */
export async function deferredReplyEmbed(target: Message | CommandInteraction, embed: EmbedBuilder) {
    return deferredReply(target, {embeds: [embed]});
}

/**
 * Gets the author of a message or interaction.
 * @param target - The `Message` or `CommandInteraction` to get the author of.
 */
export function author(target: Message | CommandInteraction) {
    return target instanceof CommandInteraction ? target.user : target.author;
}

/**
 * Truncates a string to a set length, appending a footer indicating how many characters were truncated (if any).
 * @param str - The string to truncate.
 * @param len - The length to truncate the string to.
 */
export function truncate(str: string, len: number) {
    if (str.length <= len) return str;

    const diff = len - str.length;
    // 24 is the length of truncateMessage without ${truncated}
    const truncated = diff + 24 + String(diff + 24).length;
    const truncateMessage = `\n[Truncated ${truncated} characters]`;

    return str.slice(0, len - truncated) + truncateMessage;
}

type SplitMessageOpts = {len: number, char?: string, prepend?: string, append?: string};

/**
 * Splits a string into chunks of no greater than `len` length at a designated character, optionally prepending
 * and appending a "continuation" string. See {@link https://discord.js.org/#/docs/discord.js/v13/class/Util?scrollTo=s-splitMessage discord.js 13's `Util.splitMessage`}.
 *
 * @param str - The string to split.
 * @param len - The length of each chunk.
 * @param char - The (optional) character to split the string at.
 * @param prepend - The (optional) string to prepend to each chunk, excluding the first.
 * @param append - The (optional) string to append to each chunk, excluding the last.
 */
export function splitMessage(str: string, {len, char = '', prepend = '', append = ''}: SplitMessageOpts) {
    const chunks: string[] = [];

    let i = 0;
    while (true) {
        const prefix = i === 0 ? '' : prepend;
        const isLastChunk = i + len - prefix.length >= str.length;
        const suffix = isLastChunk ? '' : append;

        const o = char && !isLastChunk
            ? str.lastIndexOf(char, i + len - prefix.length - suffix.length)
            : i + len - prefix.length - suffix.length;
        if (o === -1 || o <= i) throw new Error('Could not split by char while maintaining max length.');

        chunks.push(`${prefix}${str.substring(i, o)}${suffix}`);

        i = o + char.length;
        if (isLastChunk) break;
    }

    return chunks;
}

/**
 * Replies to a message or interaction with a multi-embed, paginated message.
 * @param target - The `Message` or `CommandInteraction` to reply to.
 * @param pages - The pages of the message, represented by an array of embeds.
 */
export async function pagedMessage(target: Message | CommandInteraction, pages: EmbedBuilder[]) {
    if (!pages.length) return;
    if (pages.length === 1) return reply(target, {embeds: [pages[0]]});

    let index = 0;

    // TODO: change middle "button" page indicator to select menu
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('counter')
            .setLabel((index + 1).toString())
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('last')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary),
    );

    const pagedMessage = await reply(target, {embeds: [pages[0]], components: [buttonRow]});
    const collector = pagedMessage.createMessageComponentCollector({time: 30000});
    const authorID = author(target).id;

    collector.on('collect', i => {
        // If the interaction was not generated by the original message author, inform them they are not allowed to switch pages
        if (i.user.id !== authorID) return void i.reply({
            embeds: [err('PAGINATION_ERROR', 'Non-author users are not allowed to switch pages on commands they didn\'t send')],
            ephemeral: true
        });

        // Defer component loading to prevent "This interaction failed"
        i.deferUpdate();

        switch (i.customId) {
            case 'first': index = 0; break;
            case 'previous': index = index === 0 ? pages.length - 1 : index - 1; break;
            case 'next': index = (index + 1) % pages.length; break;
            case 'last': index = pages.length - 1; break;
        }
        buttonRow.components[2].setLabel((index + 1).toString());
        pagedMessage.edit({embeds: [pages[index]], components: [buttonRow]});
    });

    // Disable all buttons on timeout
    collector.on('end', () => {
        buttonRow.components.forEach(x => x.setDisabled(true));
        pagedMessage.edit({embeds: [pages[index]], components: [buttonRow]});
    });
}
