import {isInField, addToField} from '../utils/tokenFieldManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'censor',
    description: 'Censor a user (delete their messages when sent).',
    usage: 'censor @[user]',
    examples: 'censor @example',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;

        if (!userTarget) return message.reply("please mention a valid member of this server");
        if (userTarget.id === message.author.id) return message.reply("you cannot censor yourself!");
        if (userTarget.bot) return message.reply("bots cannot be censored!"); // should bots be allowed to be censored?

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });
        if (isInField(tag, 'censored_users', userTarget.id)) return message.reply("that user is already censored!");

        await addToField(tag, 'censored_users', userTarget.id);
        await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Now censoring ${userTarget.tag}!`);
    }
}
