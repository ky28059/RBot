import {isInField, addToField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'blacklist',
    aliases: ['hackban'],
    description: 'Add or remove a user from the server blacklist (blacklisted users are banned upon joining).',
    usage: ['blacklist add @[user]', 'blacklist remove @[user]'],
    examples: ['blacklist add @example', 'blacklist remove @example'],
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const action = parsed.first;
        const userTarget = parsed.userTarget;

        if (!userTarget) return message.reply("please mention a valid user id");
        if (userTarget.id === message.author.id) return message.reply("you cannot blacklist yourself!");
        if (!action) return message.reply('you must specify an action to perform with that user!');

        const tag = await client.GuildTags.findOne({ where: { guildID: guild.id } });
        let messageArg;

        switch (action) {
            case 'add':
                if (isInField(tag, 'blacklist', userTarget.id)) return message.reply("that user is already blacklisted!");
                await addToField(tag, 'blacklist', userTarget.id);
                messageArg = 'added to';
                break;

            case 'remove':
                if (!isInField(tag, 'blacklist', userTarget.id)) return message.reply("that user is not blacklisted!");
                await removeFromField(tag, 'blacklist', userTarget.id);
                messageArg = 'removed from';
                break;

            default:
                return message.reply(`${action} is not a valid action!`);
        }

        await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(),
            `**${userTarget} has been ${messageArg} this server's blacklist by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`${userTarget.tag} has been ${messageArg} this server's blacklist!`);
    }
}