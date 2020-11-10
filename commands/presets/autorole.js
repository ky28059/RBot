import {isInField, addToField, removeFromField} from '../../utils/tokenManager.js';
import {log} from "../utils/logger.js";

export default {
    name: 'autorole',
    description: 'Adds / removes roles from the autorole (to be added to new members upon join).',
    usage: 'autorole [add / remove] @[role]',
    examples: ['autorole add @verified', 'autorole remove @moderator'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    clientPermReqs: 'MANAGE_ROLES',
    async execute(message, parsed, client) {
        const roleTarget = parsed.roleTarget;
        const guild = message.guild;
        const action = parsed.first;

        if (!roleTarget) return message.reply('you must specify a role to add/remove from autorole!');
        if (!roleTarget.editable) return message.reply('that role is too high up in the hierarchy! Please adjust it so that my highest role is above that role!');
        if (!action) return message.reply('you must specify an action to perform with that role!');

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });
        let messageArg;

        switch (action) {
            case 'add':
                if (isInField(tag, 'autoroles', roleTarget.id)) return message.reply("that role is already in autorole!");
                await addToField(tag, 'autoroles', roleTarget.id);
                messageArg = 'added to';
                break;

            case 'remove':
                if (!isInField(tag, 'autoroles', roleTarget.id)) return message.reply("that role is not in autorole!");
                await removeFromField(tag, 'autoroles', roleTarget.id);
                messageArg = 'removed from';
                break;

            default:
                return message.reply(`${action} is not a valid action!`);
        }

        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(),
            `**${roleTarget} has been ${messageArg} this server's autorole by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`${roleTarget.id} has been ${messageArg} this server's autorole!`);
    }
}