import {isInField, addToField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'censor',
    description: 'Censor a user (delete their messages when sent) or word (delete messages containing that word).',
    usage: ['censor @[user]', 'censor [word(s)]'],
    examples: ['censor @example', 'censor Tiananmen', 'censor Tiananmen CCP'],
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const userTarget = parsed.userTarget;

        // Censorship of users
        if (userTarget) {
            if (userTarget.id === message.author.id) return message.reply("you cannot censor yourself!");
            if (userTarget.bot) return message.reply("bots cannot be censored!"); // should bots be allowed to be censored?
            if (isInField(tag, 'censored_users', userTarget.id)) return message.reply("that user is already censored!");

            await addToField(tag, 'censored_users', userTarget.id);
            await log(client, guild, tag, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
            return message.channel.send(`Now censoring ${userTarget.tag}!`);
        }

        // Censorship of words
        if (parsed.first) {
            let censored = [];

            for (let censorPhrase of parsed.raw) {
                if (isInField(tag, 'censored_words', censorPhrase)) return message.reply('that phrase is already censored!');
                censored.push(censorPhrase);
            }
            await addToField(tag, 'censored_words', censored);
            return message.channel.send(`Now censoring the mention of \`[${censored.join(', ')}]\`!`);
        }

        return message.reply('please specify what to censor!');
    }
}
