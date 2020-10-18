import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export default {
    name: 'toggle',
    description: 'Toggles whether the specific action will be logged.',
    usage: 'toggle [action or actions]',
    examples: ['toggle messagedelete', 'toggle messagedelete memberjoin memberleave'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed) {
        const guild = message.guild;
        const presets = parsed.raw;
        if (!presets) return message.reply('you must specify the logged actions to toggle!');

        const path = `./tokens/${guild.id}.json`; // path and whatnot super finnicky rn
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        const tokenData = await readToken(guild);
        let newPresets = [];

        for (let preset of presets) { // Weird glitch where running !toggle without any arguments sets [] to []?
            const field = tokenData[`log${preset}`];
            if (typeof field === 'undefined') return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
            tokenData[`log${preset}`] = !tokenData[`log${preset}`];
            newPresets.push(tokenData[`log${preset}`]);
        }

        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Success! \`[${presets.join(', ')}]\`s have been set to \`[${newPresets.join(', ')}]!\``);
    }
}
