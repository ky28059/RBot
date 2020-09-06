import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from "fs";

export async function autorole(message, action, role) {
    const guild = message.guild;
    if (!guild.member(message.author).hasPermission('MANAGE_GUILD')) return message.reply('you do not have sufficient perms to do that!');
    if (!role) return message.reply('you must specify a role to add/remove from autorole!');
    if (!role.editable) return message.reply('that role is too high up in the hierarchy! Please adjust it so that my highest role is above that role!');
    if (!action) return message.reply('you must specify what to do with that role!');

    const path = `./tokens/${guild.id}.json`;
    if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

    const tokenData = await readToken(guild);

    switch (action) {
        case 'add':
            if (tokenData.autoroles && tokenData.autoroles.includes(role.id)) return message.reply("that role has already been added to autorole!");
            tokenData.autoroles += role.id + ' ';
            break;

        case 'remove':
            if (tokenData.autoroles && !tokenData.autoroles.includes(role.id)) return message.reply("that role has not been added to autorole!");
            tokenData.autoroles = tokenData.autoroles.replace(role.id + ' ', '');
            break;

        default:
            return message.reply(`${action} is not a valid action!`);
    }
    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Success! Autorole has been updated!`);
}