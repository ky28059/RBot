import {createTextCommand} from '../../utils/parseCommands';


export default createTextCommand<{message: string}>({
    name: 'say',
    description: 'Repeats your message.',
    pattern: '<message>',
    examples: 'say Hello world!',
    async execute(message, parsed) {
        await message.channel.send({content: parsed.message, allowedMentions: {parse: []}});
    }
});
