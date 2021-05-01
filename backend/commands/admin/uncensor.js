import {isInField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'uncensor',
    description: 'Uncensor a user or word.',
    pattern: '[Target] [...Rest]?',
    examples: 'uncensor @example',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const target = client.users.cache.get(parsed.target.match(/^<@!?(\d+)>$/)?.[1] ?? parsed.target);

        // Uncensorship of users
        if (target) {
            if (!isInField(tag, 'censored_users', target.id))
                // This being an IllegalArgumentError is shaky at best
                throw new IllegalArgumentError(this.name, `${target} was not censored`);

            await removeFromField(tag, 'censored_users', target.id);
            await log(client, guild, tag.logchannel, 0x7f0000, target.tag, target.avatarURL(), `**${target} was uncensored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
            return message.channel.send(`Now uncensoring ${target.tag}!`);
        }

        // Uncensorship of words
        let phrases = [parsed.target];
        if (parsed.rest) phrases = phrases.concat(parsed.rest);
        let uncensored = [];

        for (let uncensorPhrase of phrases) {
            if (!isInField(tag, 'censored_words', uncensorPhrase, 'ҩ'))
                // Once again, shaky at best
                throw new IllegalArgumentError(this.name, `\`${uncensorPhrase}\` was not censored`);
            if (uncensored.includes(uncensorPhrase))
                throw new IllegalArgumentError(this.name, `Attempt to uncensor \`${uncensorPhrase}\` twice`);
            uncensored.push(uncensorPhrase);
        }

        await removeFromField(tag, 'censored_words', uncensored, 'ҩ');
        return message.channel.send(`Now uncensoring the mention of \`[${uncensored.join(', ')}]\`!`);
    }
}
