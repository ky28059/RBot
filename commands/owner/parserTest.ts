import {createTextCommand} from '../../utils/commands';
import parse from '../../utils/argParser';


export default createTextCommand<{pattern: string, args: string}>({
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[pattern] <args>',
    examples: 'parserTest "[field1] @[field2] <field3>?" one two three four',
    ownerOnly: true,
    async execute(message, parsed) {
        const dummyCommand = {
            name: 'test',
            pattern: parsed.pattern,
        }

        await message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        await message.channel.send(`
            Custom parse: \`${JSON.stringify(parse(parsed.args, dummyCommand, message.client, message.guild))}\`
        `);
    }
});
