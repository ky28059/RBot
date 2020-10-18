export default {
    name: 'roll',
    aliases: ['rng', 'dice'],
    description: 'Rolls y x sided die, defaults to 1 die and 6 sides when numbers are not given.',
    usage: ['roll [sides] [dice]', 'roll [dnd notation]'],
    execute(message, parsed, client) {
        let args = parsed.raw;
        let sides = args[0];
        let dice = args[1];

        // Support dnd notation like "3d8"
        let dndNotation = sides.split('d');
        if (dndNotation.length > 1) {
            dice = dndNotation[0];
            sides = dndNotation[1];
        }
        if (!dice || !Number(dice)) dice = 1;
        if (!sides || !Number(sides)) sides = 6;

        let rolls = [];
        for (let i = 0; i < dice; i++) {
            let roll = Math.floor(Math.random() * Math.floor(sides)) + 1;
            rolls.push(roll);
        }

        if (rolls.length === 1) return message.channel.send(`Rolled a **${sides}** sided die and got **${rolls[0]}**!`);

        let total = 0;
        rolls.forEach(roll => total += roll);

        message.channel.send(`Rolled **${dice}** **${sides}** sided die and got **[${rolls.join(', ')}]**, for a total of **${total}**!`);
    }
}