import {Message} from 'discord.js';

export default {
    name: 'choose',
    description: 'Chooses at random between several options.',
    pattern: '[...options]',
    examples: ['choose red blue', 'choose "hip hop" classical'],
    execute(message: Message, parsed: {options: string[]}) {
        const options = parsed.options;
        const index = Math.floor(Math.random() * options.length);
        message.channel.send({content: options[index], allowedMentions: {parse: []}});
    }
}
