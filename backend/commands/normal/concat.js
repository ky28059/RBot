import MissingArgumentError from '../../errors/MissingArgumentError.js';

export default {
    name: 'concat',
    aliases: ['cat'],
    description: 'Says a message concatenated from multiple arguments.',
    usage: 'concat [arg 1] [arg 2] ... [arg n]',
    examples: ['concat Hello world!', 'concat <:notlikeduck :762731625498542091>'],
    execute(message, parsed) {
        const args = parsed.raw;
        if (!args.length)
            throw new MissingArgumentError(this.name, '[args]');

        message.channel.send(args.join(''), {allowedMentions: {parse: []}});
    }
}
