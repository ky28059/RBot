import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';

export default {
    name: 'autorole',
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    clientPermReqs: 'MANAGE_ROLES',
    async execute(message, args, parsed, client) {
        const roleTarget = parsed.roleTarget;
        const guild = message.guild;
        const action = parsed.first;

        if (!roleTarget) return message.reply('you must specify a role to add/remove from autorole!');
        if (!roleTarget.editable) return message.reply('that role is too high up in the hierarchy! Please adjust it so that my highest role is above that role!');
        if (!action) return message.reply('you must specify what to do with that role!');

        const path = `./tokens/${guild.id}.json`;
        const tokenData = await readToken(guild);

        switch (action) {
            case 'add':
                if (tokenData.autoroles && tokenData.autoroles.includes(roleTarget.id)) return message.reply("that role has already been added to autorole!");
                tokenData.autoroles += roleTarget.id + ' ';
                break;

            case 'remove':
                if (tokenData.autoroles && !tokenData.autoroles.includes(roleTarget.id)) return message.reply("that role has not been added to autorole!");
                tokenData.autoroles = tokenData.autoroles.replace(roleTarget.id + ' ', '');
                break;

            default:
                return message.reply(`${action} is not a valid action!`);
        }
        // TODO: log this
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Success! Autorole has been updated!`);
    }
}