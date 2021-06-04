import {Command} from '../../types/Command';
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export default {
    name: 'emoji',
    description: 'Fetches the requested emoji and sends it.',
    pattern: '[EmojiID]',
    examples: 'emoji 762731625498542091',
    async execute(message, parsed, client) {
        const id = parsed.emojiid;

        const emoji = client.emojis.cache.get(id);
        if (!emoji) throw new IllegalArgumentError(this.name, `Emoji with ID \`${id}\` not found`);

        await message.channel.send(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`);
    }
} as Command;
