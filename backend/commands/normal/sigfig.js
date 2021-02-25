import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'sigfig',
    description: 'gets the sigfig info of a given number.',
    pattern: '[Number]',
    examples: ['sigfig 5.0', 'sigfig 32.582736'],
    execute(message, parsed) {
        let { number } = parsed;

        if (isNaN(number))
            throw new IllegalArgumentError(this.name, 'Field `Number` must be a valid number');
        if (Number(number) > Number.MAX_SAFE_INTEGER)
            throw new IllegalArgumentError(this.name, 'Field `Number` cannot exceed the JS maximum safe integer');

        // Since e is never significant, ignore it for the calculations and add it in at the end
        let [num, expt] = number.split('e');
        let exponent = expt !== undefined
            ? `e${expt}`
            : '';

        let [whole, dec] = num.split('.');
        if (dec !== undefined) {
            // If a decimal point exists, everything is significant
            return message.channel.send(`**${num}**${exponent}, ${num.length - 1} significant figure(s)`);
        }

        let {text, significant} = parseTrailingZeroes(num);
        message.channel.send(`${text}${exponent}, ${significant} significant figure(s)`);
    }
}

const parseTrailingZeroes = (num) => {
    let temp = Number(num);
    let numTrailing = 0;

    // Base case for 0 to prevent infinite loop
    if (temp === 0) return {
        text: num,
        significant: 0
    };

    // Loop until all trailing zeros have been sliced
    while (temp % 10 === 0) {
        temp /= 10;
        numTrailing++;
    }

    let significant = num.length - numTrailing;
    return {
        text: `**${num.slice(0, significant)}**${num.slice(significant)}`,
        significant: significant
    };
}
