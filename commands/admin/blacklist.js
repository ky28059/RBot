import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'blacklist',
    aliases: ['hackban'],
    description: 'Blacklist a user from this server (ban them upon joining).',
    usage: 'blacklist @[user]',
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;

        if (!userTarget) return message.reply("please mention a valid user id");
        if (userTarget.id === message.author.id) return message.reply("you cannot blacklist yourself!");

        const path = `./tokens/${guild.id}.json`;

        const tokenData = await readToken(guild);
        if (tokenData.blacklist.includes(userTarget.id)) return message.reply("that user is already blacklisted!");

        tokenData.blacklist += userTarget.id + ' ';
        await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} has been added to this server's blacklist by ${message.author}**\n[Jump to message](${message.url})`);
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`${userTarget.tag} has been added to this server's blacklist!`);
    }
}