import parse from '../../utils/argumentParser.js';


export default {
    name: 'parserTest',
    aliases: ['ptest'],
    description: 'Tests the RBot Argument Parser.',
    usage: 'parserTest [pattern] [...args]',
    pattern: '[Pattern] <Args>',
    examples: 'parserTest "[Field1] [Field2]? <Field3>" one two three four',
    ownerOnly: true,
    execute(message, parsed, client) {
        message.channel.send(`Parsed arguments to this command: \`${JSON.stringify(parsed)}\``);
        message.channel.send(`
            Custom parse: \`${JSON.stringify(parse(parsed.args, {name: 'test', pattern: parsed.pattern}, client, message.guild))}\`
        `);
    }
}