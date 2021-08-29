import IllegalArgumentError from '../../errors/IllegalArgumentError.js';

export default {
    name: 'emoji',
    description: 'Fetches the requested emoji and sends it.',
    pattern: '[EmojiID]',
    examples: 'emoji 762731625498542091',
    execute(message, parsed, client) {
        const id = parsed.emojiid;

        const emoji = client.emojis.cache.get(id);
        if (!emoji) throw new IllegalArgumentError(this.name, `Emoji with ID \`${id}\` not found`);

        message.channel.send(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`);
    }
}
