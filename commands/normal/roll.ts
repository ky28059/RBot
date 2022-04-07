import {Message, Util} from 'discord.js';
import IntegerRangeError from '../../errors/IntegerRangeError';


export default {
    name: 'roll',
    aliases: ['rng', 'dice'],
    description: 'Rolls y x sided die, defaults to 1 die and 6 sides when numbers are not given.',
    usage: ['roll [sides] [dice]', 'roll [dnd notation]'],
    pattern: '[Sides]? [Dice]?',
    examples: ['roll 5', 'roll 5 2', 'roll 3d8'],
    execute(message: Message, parsed: {sides?: string, dice?: string}) {
        let {sides, dice} = parsed;

        // Support dnd notation like "3d8"
        if (sides) {
            const dndNotation = sides.split('d');
            if (dndNotation.length > 1) [dice, sides] = dndNotation;
        }

        let diceNum = Number(dice);
        let sidesNum = Number(sides);
        if (isNaN(diceNum)) diceNum = 1;
        if (isNaN(sidesNum)) sidesNum = 6;

        // Prevent spam somewhat
        if (diceNum > 300 || diceNum < 0)
            throw new IntegerRangeError(this.name, 'Dice', 0, 300);

        let rolls = [];
        let total = 0;
        for (let i = 0; i < diceNum; i++) {
            let roll = Math.ceil(Math.random() * Math.floor(sidesNum));
            rolls.push(roll);
            total += roll;
        }

        if (rolls.length === 1)
            return message.channel.send(`Rolled a **${sidesNum}** sided die and got **${rolls[0]}**!`);

        const splitDescription = Util.splitMessage(`Rolled **${diceNum}** **${sidesNum}** sided die and got **[${rolls.join(', ')}]**, for a total of **${total}**!`, {
            maxLength: 2000,
            char: ' ',
            prepend: '**...',
            append: '...**'
        });

        splitDescription.forEach(async (m) => {
            message.channel.send(m);
        });
    }
}