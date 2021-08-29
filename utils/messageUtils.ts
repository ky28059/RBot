import {Message, MessageComponentInteraction, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} from 'discord.js';

export async function pagedMessage(message: Message, pages: MessageEmbed[]) {
    if (!pages.length) return;
    if (pages.length === 1) return message.channel.send({embeds: [pages[0]]});

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

    const pagedMessage = await message.channel.send({embeds: [pages[0]], components: [buttonRow]});
    const filter = (interaction: MessageComponentInteraction) =>
        interaction.customId === 'button' && interaction.user.id === message.author.id;
    const collector = pagedMessage.createMessageComponentCollector({filter, time: 30000});

    collector.on('collect', interaction => {
        switch (interaction.customId) {
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
