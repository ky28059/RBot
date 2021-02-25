import {isInField, addToField, removeFromField} from '../../utils/tokenManager.js';
import {log} from '../utils/logger.js';
import {success} from '../../utils/messages.js';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'blacklist',
    aliases: ['hackban'],
    description: 'Add or remove a user from the server blacklist (blacklisted users are banned upon joining).',
    pattern: '[Action] @[Target]',
    examples: ['blacklist add @example', 'blacklist remove @example'],
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const {action, target} = parsed;

        if (target.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');

        switch (action) {
            case 'add':
                if (isInField(tag, 'blacklist', target.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${target} already blacklisted`);

                await addToField(tag, 'blacklist', target.id);
                break;

            case 'remove':
                if (!isInField(tag, 'blacklist', target.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${target} not blacklisted`);

                await removeFromField(tag, 'blacklist', target.id);
                break;

            default:
                throw new IllegalArgumentError(`\`${action}\` not a valid action`);
        }

        await log(client, guild, tag, 0x7f0000, target.tag, target.avatarURL(),
            `**${target} has been ${action === 'add' ? 'added to' : 'removed from'} this server's blacklist by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(success({desc: `${target} ${action === 'add' ? 'added to' : 'removed from'} server blacklist`}));
    }
}