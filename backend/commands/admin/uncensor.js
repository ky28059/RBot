import {isInField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'uncensor',
    description: 'Uncensor a user.',
    usage: 'uncensor @[user]',
    examples: 'uncensor @example',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;

        // Uncensorship of users
        if (userTarget) {
            if (!isInField(tag, 'censored_users', userTarget.id)) return message.reply("that user is already censored!");

            await removeFromField(tag, 'censored_users', userTarget.id);
            await log(client, guild, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
            return message.channel.send(`Now uncensoring ${userTarget.tag}!`);
        }

        // Uncensorship of words
        if (parsed.first) {
            let uncensored = [];

            for (let uncensorPhrase of parsed.raw) {
                if (!isInField(tag, 'censored_words', uncensorPhrase)) return message.reply('that phrase was not censored!');
                uncensored.push(uncensorPhrase);
            }
            await removeFromField(tag, 'censored_words', uncensored);
            return message.channel.send(`Now uncensoring the mention of \`[${uncensored.join(', ')}]\`!`);
        }

        return message.reply('please specify what to uncensor!');
    }
}
