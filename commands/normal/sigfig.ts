import {createSlashCommand} from '../../util/commands';
import {SlashCommandBuilder} from '@discordjs/builders';
import {reply} from '../../util/messageUtils';
import NumberConversionError from '../../errors/NumberConversionError';


export const data = new SlashCommandBuilder()
    .setName('sigfig')
    .setDescription('Gets the sigfig info of a given number.')
    .addStringOption(option => option
        .setName('number')
        .setDescription('The number to get the sigfigs of.')
        .setRequired(true))

export default createSlashCommand<{number: string}>({
    data,
    async execute(message, parsed) {
        const { number } = parsed;

        if (isNaN(Number(number)))
            throw new NumberConversionError(data.name, 'number');

        // Since e is never significant, ignore it for the calculations and add it in at the end
        const [num, expt] = number.split('e');
        const exponent = expt ? `e${expt}` : '';

        // Special case for 0 and variants (0.0)
        if (Number(num) === 0)
            return reply(message, `${number}, 0 significant figure(s).`);

        // Regex borrowed and modified from https://sheeptester.github.io/hello-world/sigfig
        const [, before, sig, after, sig2, dot2, before3, sig3]
            = num.match(/^-?(0*)(?:((?:[1-9][0-9]*)?[1-9])(0*)|([1-9][0-9]*(?:\.[0-9]+)?)(\.?)|\.(0*)([1-9][0-9]*))$/)!;

        if (sig) // Integers (first pattern) - 034500
            return reply(message, `${before}**${sig}**${after}${exponent}, ${sig.length} significant figure(s).`);
        if (sig2) // Decimals with nonzero left sides (second pattern) - 03.450, 034500.
            return reply(message, `${before}**${sig2}**${dot2}${exponent}, ${sig2.replace('.', '').length} significant figure(s).`);
        if (sig3) // Decimals with zero left sides (third pattern) - 0.003450
            return reply(message, `${before}.${before3}**${sig3}**${exponent}, ${sig3.length} significant figure(s).`);
    }
});
