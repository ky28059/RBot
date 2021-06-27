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
                index = 0;
                break;
            case '◀️':
                index = index === 0 ? pages.length - 1 : index - 1;
                break;
            case '▶️':
                index = (index + 1) % pages.length;
                break;
            case '⏭️':
                index = pages.length - 1;
                break;
        }
        pagedMessage.edit(pages[index]);
        reaction.users.remove(message.author);
    });
}
