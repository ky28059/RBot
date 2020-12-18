import {isInField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


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
            if (!isInField(tag, 'censored_users', userTarget.id))
                // This being an IllegalArgumentError is shaky at best
                throw new IllegalArgumentError(this.name, `${userTarget} was not censored`);

            await removeFromField(tag, 'censored_users', userTarget.id);
            await log(client, guild, tag, 0x7f0000, userTarget.tag, userTarget.avatarURL(), `**${userTarget} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
            return message.channel.send(`Now uncensoring ${userTarget.tag}!`);
        }

        // Uncensorship of words
        if (parsed.first) {
            let uncensored = [];

            for (let uncensorPhrase of parsed.raw) {
                if (!isInField(tag, 'censored_words', uncensorPhrase))
                    // Once again, shaky at best
                    throw new IllegalArgumentError(this.name, `\`${uncensorPhrase}\` was not censored`);
                if (uncensored.includes(uncensorPhrase))
                    throw new IllegalArgumentError(this.name, `Attempt to uncensor \`${uncensorPhrase}\` twice`);
                uncensored.push(uncensorPhrase);
            }
            await removeFromField(tag, 'censored_words', uncensored);
            return message.channel.send(`Now uncensoring the mention of \`[${uncensored.join(', ')}]\`!`);
        }

        throw new MissingArgumentError(this.name, 'Target');
    }
}
