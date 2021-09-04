import parse from '../../utils/argumentParser';
import {Message} from "discord.js";


export default {
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    pattern: '[Pattern] <Args>?',
    examples: 'parserTest "[Field1] @[Field2] <Field3>?" one two three four',
    ownerOnly: true,
    execute(message: Message, parsed: {pattern: string, args: string}) {
        const dummyCommand = {
            name: 'test',
            description: this.description,
            pattern: parsed.pattern,
            commandGroup: 'owner',
            execute: async () => {}
        }

        message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        message.channel.send(`
            Custom parse: \`${JSON.stringify(parse(parsed.args, 
            dummyCommand, message.client, message.guild))}\`
        `);
    }
}
