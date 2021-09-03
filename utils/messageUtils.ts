import {
    CommandInteraction, Message, MessageEmbed,
    MessageActionRow, MessageButton, MessageSelectMenu, MessageComponentInteraction, MessageOptions,
} from 'discord.js';


// Replies to a message or interaction
export async function reply(target: Message | CommandInteraction, content: string | MessageOptions) {
    return target instanceof CommandInteraction
        ? target.followUp(content)
        : target.channel.send(content);
}

// Returns the author of a message or interaction
export function author(target: Message | CommandInteraction) {
    return target instanceof CommandInteraction ? target.user : target.author;
}

// Utility for sending a lengthy, multi-paged embed message
export async function pagedMessage(target: Message | CommandInteraction, pages: MessageEmbed[]) {
    if (!pages.length) return;
    if (pages.length === 1) return reply(target, {embeds: [pages[0]]});

    let index = 0;
    const buttonRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('first')
                .setLabel('⏮️')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('previous')
                .setLabel('◀️')
                .setStyle('SECONDARY'),
            /* Maybe a select menu that let you choose pages would be nice
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Nothing selected')
                .addOptions([
                    {
                        label: 'Select me',
                        description: 'This is a description',
                        value: 'first_option',
                    },
                    {
                        label: 'You can select me too',
                        description: 'This is also a description',
                        value: 'second_option',
                    },
                ]),
            */
            new MessageButton()
                .setCustomId('counter')
                .setLabel(String(index))
                .setDisabled(true)
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('last')
                .setLabel('⏭️')
                .setStyle('SECONDARY'),
        );

    const pagedMessage = await reply(target, {embeds: [pages[0]], components: [buttonRow]});
    if (!('createMessageComponentCollector' in pagedMessage)) return;

    const authorID = target instanceof CommandInteraction ? target.user.id : target.author.id;
    const filter = (i: MessageComponentInteraction) =>
        i.customId === 'button' && i.user.id === authorID;
    const collector = pagedMessage.createMessageComponentCollector({filter, time: 30000});

    collector.on('collect', i => {
        switch (i.customId) {
            case 'first':
                index = 0;
                break;
            case 'previous':
                index = index === 0 ? pages.length - 1 : index - 1;
                break;
            case 'next':
                index = (index + 1) % pages.length;
                break;
            case 'last':
                index = pages.length - 1;
                break;
        }
        (buttonRow.components.find(x => x.customId === 'counter') as MessageButton).setLabel(String(index));
        pagedMessage.edit({embeds: [pages[index]], components: [buttonRow]});
    });
}
