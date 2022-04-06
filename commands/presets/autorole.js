import {isInField, addToField, removeFromField} from '../../utils/tokenManager.js';
import {log} from '../../utils/logger.ts';
import {success} from '../../utils/messages.js';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from '../../errors/ActionUntakeableError.js';


export default {
    name: 'autorole',
    description: 'Adds / removes roles from the autorole (to be added to new members upon join).',
    pattern: '[Action] &[Role]',
    examples: ['autorole add @verified', 'autorole remove @moderator'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    clientPermReqs: 'MANAGE_ROLES',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const {role, action} = parsed;

        switch (action) {
            case 'add':
                if (!role.editable)
                    throw new ActionUntakeableError(this.name, `${role} too high up in hierarchy, cannot be assigned to others`);
                if (isInField(tag, 'autoroles', role.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${role} already in autorole`);

                await addToField(tag, 'autoroles', role.id);
                break;

            case 'remove':
                if (!isInField(tag, 'autoroles', role.id))
                    // Shaky
                    throw new IllegalArgumentError(this.name, `${role} not in autorole`);

                await removeFromField(tag, 'autoroles', role.id);
                break;

            default:
                throw new IllegalArgumentError(this.name, `\`${action}\` not a valid action`);
        }

        await log(client, guild, tag.logchannel, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**${role} has been ${action === 'add' ? 'added to' : 'removed from'} this server's autorole by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(success({desc: `${role} ${action === 'add' ? 'added to' : 'removed from'} server autorole`}));
    }
}