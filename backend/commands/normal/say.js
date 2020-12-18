import MissingArgumentError from '../../errors/MissingArgumentError.js';

export default {
    name: 'say',
    description: 'Repeats your message.',
    usage: 'say [content]',
    examples: 'say Hello world!',
    execute(message, parsed) {
        const content = parsed.joined;
        if (!content) throw new MissingArgumentError(this.name, 'Message');

        message.channel.send(content, {allowedMentions: {parse: []}});
    }
}
