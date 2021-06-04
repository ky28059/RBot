import {Command} from '../../types/Command';

export default {
    name: 'concat',
    aliases: ['cat'],
    description: 'Says a message concatenated from multiple arguments.',
    pattern: '[...Args]',
    examples: ['concat Hello world!', 'concat <:notlikeduck :762731625498542091>'],
    async execute(message, parsed) {
        const args = parsed.args;
        await message.channel.send(args.join(''), {allowedMentions: {parse: []}});
    }
} as Command;
