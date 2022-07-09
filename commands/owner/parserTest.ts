import {TextCommand} from '../../utils/parseCommands';
import parse from '../../utils/argParser';


const command: TextCommand<{pattern: string, args: string}> = {
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[pattern] <args>?',
    examples: 'parserTest "[field1] @[field2] <field3>?" one two three four',
    ownerOnly: true,
    async execute(message, parsed) {
        const dummyCommand = {
            name: 'test',
            description: this.description,
            pattern: parsed.pattern,
            commandGroup: 'owner',
            execute: async () => {}
        }

        await message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        await message.channel.send(`
            Custom parse: \`${JSON.stringify(parse(parsed.args, 
            dummyCommand, message.client, message.guild))}\`
        `);
    }
}

export default command;
