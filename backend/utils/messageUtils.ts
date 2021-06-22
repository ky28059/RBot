export async function pagedMessage(message, pages) {
    if (!pages.length) return;
    if (pages.length === 1) return message.channel.send(pages[0]);

    const pagedMessage = await message.channel.send(pages[0]);
    await pagedMessage.react('⏮️');
    await pagedMessage.react('◀️');
    await pagedMessage.react('▶️');
    await pagedMessage.react('⏭️');

    const filter = (reaction, user) =>
        ['⏮️', '◀️', '▶️', '⏭️'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = pagedMessage.createReactionCollector(filter, {time: 30000});

    let index = 0;
    collector.on('collect', reaction => {
        switch (reaction.emoji.name) {
            case '⏮️':
                pagedMessage.edit(pages[0]);
                break;
            case '◀️':
                index = (index - 1) % pages.length;
                pagedMessage.edit(pages[index]);
                break;
            case '▶️':
                index = (index + 1) % pages.length;
                pagedMessage.edit(pages[index]);
                break;
            case '⏭️':
                pagedMessage.edit(pages[pages.length - 1])
                break;
        }
    });
}
