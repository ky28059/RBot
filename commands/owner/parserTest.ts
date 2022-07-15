import {createTextCommand} from '../../utils/commands';
import {parseTextArgs} from '../../utils/argParser';


export default createTextCommand<{pattern: string, args: string}>({
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[pattern] <args>',
    examples: 'parserTest "[field1] @[field2] <field3>?" one two three four',
    ownerOnly: true,
    async execute(message, parsed) {
        await message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        await message.channel.send(`
            Custom parse: \`${JSON.stringify(parseTextArgs('test', parsed.pattern, parsed.args, message.client, message.guild))}\`
        `);
    }
});
