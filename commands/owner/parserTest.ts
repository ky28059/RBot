import {createTextCommand} from '../../util/commands';
import {parseTextArgs} from '../../util/argParser';


export default createTextCommand<{pattern: string, args: string}>({
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[pattern] <args>',
    examples: 'parserTest "[field1] @[field2] <field3>?" one two three four',
    ownerOnly: true,
    async execute(message, parsed) {
        await message.channel.send(`Parsed arguments to this command: \`\`\`js\n${JSON.stringify(parsed)}\`\`\``);
        await message.channel.send(`
            Custom parse: \`\`\`js\n${JSON.stringify(parseTextArgs('test', parsed.pattern, parsed.args, message.client, message.guild))}\`\`\`
        `);
    }
});
