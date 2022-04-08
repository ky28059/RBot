import {Message} from 'discord.js';

export default {
    name: 'say',
    description: 'Repeats your message.',
    pattern: '<message>',
    examples: 'say Hello world!',
    execute(message: Message, parsed: {message: string}) {
        message.channel.send({content: parsed.message, allowedMentions: {parse: []}});
    }
}
