import {isInField, removeFromField} from '../utils/tokenFieldManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'uncensor',
    description: 'Uncensor a user.',
    usage: 'uncensor @[user]',
    examples: 'uncensor @example',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;
        if (!userTarget) return message.reply("please mention a valid member of this server");

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });
        if (!isInField(tag, 'censored_users', userTarget.id)) return message.reply("that user was not censored!");

        await removeFromField(tag, 'censored_users', userTarget.id);
        await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Now uncensoring ${userTarget.tag}!`);
    }
}
