import Discord from 'discord.js';

export default {
    name: 'emoji',
    description: 'Fetches the requested emoji and sends it.',
    usage: 'emoji [emoji ID]',
    examples: 'emoji 762731625498542091',
    execute(message, parsed, client) {
        const target = parsed.first;

        const emoji = client.emojis.cache.get(target);
        if (!emoji) return message.reply('that emoji was not found.');

        message.channel.send(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`);
    }
}
