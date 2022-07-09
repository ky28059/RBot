import {TextCommand} from '../../utils/parseCommands';


const command: TextCommand<{message: string}> = {
    name: 'say',
    description: 'Repeats your message.',
    pattern: '<message>',
    examples: 'say Hello world!',
    async execute(message, parsed) {
        await message.channel.send({content: parsed.message, allowedMentions: {parse: []}});
    }
}

export default command;
