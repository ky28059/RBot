import {TextCommand} from '../../utils/parseCommands';

// Utilities
import {isInField, addToField} from '../../utils/tokenManager';
import {log} from '../../utils/logger';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


const command: TextCommand<{target: string, rest?: string[]}, true> = {
    name: 'censor',
    description: 'Censor a user (delete their messages when sent) or word (delete messages containing that word).',
    pattern: '[Target] [...Rest]?',
    examples: ['censor @example', 'censor "Tiananmen Square"', 'censor "Tiananmen Square" "Winnie the Pooh"'],
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed, tag) {
        const guild = message.guild!;
        const target = message.client.users.cache.get(parsed.target.match(/^<@!?(\d+)>$/)?.[1] ?? parsed.target);

        // Censorship of users
        if (target) {
            if (target.id === message.author.id)
                throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
            if (target.bot)
                throw new IllegalArgumentError(this.name, '`Target` cannot be a bot'); // should bots be allowed to be censored?
            if (isInField(tag, 'censored_users', target.id))
                // This being an IllegalArgumentError is shaky at best
                throw new IllegalArgumentError(this.name, `${target} is already censored`);

            await addToField(tag, 'censored_users', target.id);
            await log(message.client, guild, {
                id: tag.logchannel, color: 0x7f0000, author: target.tag, authorIcon: target.displayAvatarURL(),
                desc: `**${target} was censored by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`
            });
            return message.channel.send(`Now censoring ${target.tag}!`);
        }

        // Censorship of words
        let phrases = [parsed.target];
        if (parsed.rest) phrases = phrases.concat(parsed.rest);
        let censored: string[] = [];

        for (let censorPhrase of phrases) {
            if (isInField(tag, 'censored_words', censorPhrase, 'ҩ'))
                // Once again, shaky at best
                throw new IllegalArgumentError(this.name, `\`${censorPhrase}\` is already censored`);
            if (censored.includes(censorPhrase))
                throw new IllegalArgumentError(this.name, `Attempt to censor \`${censorPhrase}\` twice`);
            censored.push(censorPhrase);
        }

        await addToField(tag, 'censored_words', censored, 'ҩ');
        await message.channel.send(`Now censoring the mention of \`[${censored.join(', ')}]\`!`);
    }
}

export default command;
