import {Command} from '../../types/Command';
import parse from '../../utils/argumentParser';


export default {
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[Pattern] <Args>?',
    examples: 'parserTest "[Field1] @[Field2] <Field3>?" one two three four',
    ownerOnly: true,
    async execute(message, parsed, client) {
        await message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        await message.channel.send(`
            Custom parse: \`${JSON.stringify(parse(parsed.args, 
            {name: 'test', pattern: parsed.pattern, description: this.description, examples: this.examples, execute: this.execute}, client, message.guild))}\`
        `);
    }
} as Command;
