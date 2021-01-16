import MissingArgumentError from '../../errors/MissingArgumentError.js';

export default {
    name: 'say',
    description: 'Repeats your message.',
    usage: 'say [content]',
    pattern: '<Message>',
    examples: 'say Hello world!',
    execute(message, parsed) {
        message.channel.send(parsed.message, {allowedMentions: {parse: []}});
    }
}
