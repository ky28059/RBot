import {Message} from 'discord.js';

export default {
    name: 'concat',
    aliases: ['cat'],
    description: 'Says a message concatenated from multiple arguments.',
    pattern: '[...args]',
    examples: ['concat Hello world!', 'concat <:notlikeduck :762731625498542091>'],
    execute(message: Message, parsed: {args: string[]}) {
        const args = parsed.args;
        message.channel.send({content: args.join(''), allowedMentions: {parse: []}});
    }
}
