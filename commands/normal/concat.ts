import {TextCommand} from '../../utils/parseCommands';


const command: TextCommand<{args: string[]}> = {
    name: 'concat',
    aliases: ['cat'],
    description: 'Says a message concatenated from multiple arguments.',
    pattern: '[...args]',
    examples: ['concat Hello world!', 'concat <:notlikeduck :762731625498542091>'],
    async execute(message, parsed) {
        const args = parsed.args;
        await message.channel.send({content: args.join(''), allowedMentions: {parse: []}});
    }
}

export default command;
