import {isInField, addToField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


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
            if (userTarget.id === message.author.id)
                throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
            if (userTarget.bot)
                throw new IllegalArgumentError(this.name, '`Target` cannot be a bot'); // should bots be allowed to be censored?
            if (isInField(tag, 'censored_users', userTarget.id))
                // This being an IllegalArgumentError is shaky at best
                throw new IllegalArgumentError(this.name, `${userTarget} is already censored`);

            await addToField(tag, 'censored_users', userTarget.id);
            await log(client, guild, tag, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
            return message.channel.send(`Now censoring ${userTarget.tag}!`);
        }

        // Censorship of words
        if (parsed.first) {
            let censored = [];

            for (let censorPhrase of parsed.raw) {
                if (isInField(tag, 'censored_words', censorPhrase))
                    // Once again, shaky at best
                    throw new IllegalArgumentError(this.name, `\`${censorPhrase}\` is already censored`);
                if (censored.includes(censorPhrase))
                    throw new IllegalArgumentError(this.name, `Attempt to censor \`${censorPhrase}\` twice`);
                censored.push(censorPhrase);
            }

            await addToField(tag, 'censored_words', censored);
            return message.channel.send(`Now censoring the mention of \`[${censored.join(', ')}]\`!`);
        }

        throw new MissingArgumentError(this.name, 'Target');
    }
}
