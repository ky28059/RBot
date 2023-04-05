import {createTextCommand} from '../../util/commands';


export default createTextCommand<{options: string[]}>({
    name: 'choose',
    description: 'Chooses at random between several options.',
    pattern: '[...options]',
    examples: ['choose red blue', 'choose "hip hop" classical'],
    async execute(message, parsed) {
        const options = parsed.options;
        const index = Math.floor(Math.random() * options.length);
        await message.channel.send({content: options[index], allowedMentions: {parse: []}});
    }
});
