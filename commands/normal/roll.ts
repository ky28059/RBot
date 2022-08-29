import {createTextCommand} from '../../utils/commands';
import {splitMessage} from '../../utils/messageUtils';

// Errors
import IntegerRangeError from '../../errors/IntegerRangeError';
import IntegerConversionError from '../../errors/IntegerConversionError';



export default createTextCommand<{sides?: string, dice?: string}>({
    name: 'roll',
    aliases: ['rng', 'dice'],
    description: 'Rolls y x sided die, defaults to 1 die and 6 sides when numbers are not given. Also supports dnd notation (ie. 3d8).',
    pattern: '[sides]? [dice]?',
    examples: ['roll 5', 'roll 5 2', 'roll 3d8'],
    async execute(message, parsed) {
        let {sides, dice} = parsed;

        // Support dnd notation like "3d8"
        if (sides) {
            const dndNotation = sides.split('d');
            if (dndNotation.length > 1) [dice, sides] = dndNotation;
        }

        let diceNum = Number(dice);
        let sidesNum = Number(sides);

        if (diceNum % 1 !== 0) throw new IntegerConversionError(this.name, 'dice');
        if (isNaN(diceNum)) diceNum = 1;
        if (isNaN(sidesNum)) sidesNum = 6;

        // Prevent spam somewhat
        if (diceNum > 300 || diceNum < 0)
            throw new IntegerRangeError(this.name, 'Dice', 0, 300);

        let rolls = [];
        let total = 0;
        for (let i = 0; i < diceNum; i++) {
            let roll = Math.floor(Math.random() * sidesNum) + 1;
            rolls.push(roll);
            total += roll;
        }

        if (rolls.length === 1)
            return message.channel.send(`Rolled a **${sidesNum}** sided die and got **${rolls[0]}**!`);

        const splitDescription = splitMessage(`Rolled **${diceNum}** **${sidesNum}** sided die and got **[${rolls.join(', ')}]**, for a total of **${total}**!`, {
            len: 2000,
            char: ' ',
            prepend: '**...',
            append: '...**'
        });

        splitDescription.forEach((m) => {
            message.channel.send(m);
        });
    }
});
