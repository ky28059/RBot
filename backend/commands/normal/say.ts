import {Command} from '../../types/Command';

export default {
    name: 'say',
    description: 'Repeats your message.',
    pattern: '<Message>',
    examples: 'say Hello world!',
    async execute(message, parsed) {
        await message.channel.send(parsed.message, {allowedMentions: {parse: []}});
    }
} as Command;
