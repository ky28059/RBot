import {isInField, addToField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'blacklist',
    aliases: ['hackban'],
    description: 'Add or remove a user from the server blacklist (blacklisted users are banned upon joining).',
    usage: ['blacklist add @[user]', 'blacklist remove @[user]'],
    examples: ['blacklist add @example', 'blacklist remove @example'],
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const action = parsed.first;
        const userTarget = parsed.userTarget;

        if (!userTarget)
            throw new MissingArgumentError(this.name, 'User');
        if (userTarget.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`User` cannot be yourself');
        if (!action)
            throw new MissingArgumentError(this.name, 'Action');

        let messageArg;

        switch (action) {
            case 'add':
                if (isInField(tag, 'blacklist', userTarget.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${userTarget} already blacklisted`);

                await addToField(tag, 'blacklist', userTarget.id);
                messageArg = 'added to';
                break;

            case 'remove':
                if (!isInField(tag, 'blacklist', userTarget.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${userTarget} not blacklisted`);

                await removeFromField(tag, 'blacklist', userTarget.id);
                messageArg = 'removed from';
                break;

            default:
                throw new IllegalArgumentError(`\`${action}\` not a valid action`);
        }

        await log(client, guild, tag, 0x7f0000, userTarget.tag, userTarget.avatarURL(),
            `**${userTarget} has been ${messageArg} this server's blacklist by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`${userTarget.tag} has been ${messageArg} this server's blacklist!`);
    }
}