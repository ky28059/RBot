import {splitMessage} from 'discord.js';
import IntegerRangeError from '../../errors/IntegerRangeError.js';


export default {
    name: 'roll',
    aliases: ['rng', 'dice'],
    description: 'Rolls y x sided die, defaults to 1 die and 6 sides when numbers are not given.',
    usage: ['roll [sides] [dice]', 'roll [dnd notation]'],
    pattern: '[Sides]? [Dice]?',
    examples: ['roll 5', 'roll 5 2', 'roll 3d8'],
    execute(message, parsed, client) {
        let {sides, dice} = parsed;

        // Support dnd notation like "3d8"
        if (sides) {
            let dndNotation = sides.split('d');
            if (dndNotation.length > 1) [dice, sides] = dndNotation;
        }
        if (isNaN(dice)) dice = 1;
        if (isNaN(sides)) sides = 6;

        // Prevent spam somewhat
        if (dice > 300 || dice < 0) throw new IntegerRangeError(this.name, 'Dice', 0, 300);

        let rolls = [];
        for (let i = 0; i < dice; i++) {
            let roll = Math.ceil(Math.random() * Math.floor(sides));
            rolls.push(roll);
        }

        if (rolls.length === 1) return message.channel.send(`Rolled a **${sides}** sided die and got **${rolls[0]}**!`);

        let total = rolls.reduce((a, b) => a + b);
        const splitDescription = splitMessage(`Rolled **${dice}** **${sides}** sided die and got **[${rolls.join(', ')}]**, for a total of **${total}**!`, {
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