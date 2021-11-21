import {Message} from 'discord.js';
import NumberConversionError from '../../errors/NumberConversionError';


export default {
    name: 'sigfig',
    description: 'gets the sigfig info of a given number.',
    pattern: '[Number]',
    examples: ['sigfig 5.0', 'sigfig 32.582736'],
    execute(message: Message, parsed: {number: string}) {
        let { number } = parsed;

        if (isNaN(Number(number)))
            throw new NumberConversionError(this.name, 'Number');

        // Since e is never significant, ignore it for the calculations and add it in at the end
        let [num, expt] = number.split('e');
        let exponent = expt ? `e${expt}` : '';

        // Special case for 0 and variants (0.0)
        if (Number(num) === 0)
            return message.channel.send(`${number}, 0 significant figure(s).`);

        // Regex borrowed and modified from https://sheeptester.github.io/hello-world/sigfig
        const [, before, sig, after, sig2, dot2, before3, sig3]
            = num.match(/^-?(0*)(?:((?:[1-9][0-9]*)?[1-9])(0*)|([1-9][0-9]*(?:\.[0-9]+)?)(\.?)|\.(0*)([1-9][0-9]*))$/)!;

        if (sig) // Integers (first pattern) - 034500
            return message.channel.send(`${before}**${sig}**${after}${exponent}, ${sig.length} significant figure(s).`);
        if (sig2) // Decimals with nonzero left sides (second pattern) - 03.450, 034500.
            return message.channel.send(`${before}**${sig2}**${dot2}${exponent}, ${sig2.replace('.', '').length} significant figure(s).`);
        if (sig3) // Decimals with zero left sides (third pattern) - 0.003450
            return message.channel.send(`${before}.${before3}**${sig3}**${exponent}, ${sig3.length} significant figure(s).`);
    }
}
