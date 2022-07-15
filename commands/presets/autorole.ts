import {createGuildOnlySlashSubCommands} from '../../utils/commands';
import {Message, Role} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {isInField, addToField, removeFromField} from '../../utils/tokens';
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';
import {log} from '../../utils/logger';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';


export const data = new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manages the server\'s autoroles, which are assigned to new members on join.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(command => command
        .setName('add')
        .setDescription('Adds a role to the autorole.')
        .addRoleOption(option => option
            .setName('role')
            .setDescription('The role to add.')
            .setRequired(true)))
    .addSubcommand(command => command
        .setName('remove')
        .setDescription('Removes a role from the autorole.')
        .addRoleOption(option => option
            .setName('role')
            .setDescription('The role to remove.')
            .setRequired(true)))

export default createGuildOnlySlashSubCommands<{add: {role: Role}, remove: {role: Role}}>({
    data,
    examples: ['autorole add @verified', 'autorole remove @moderator'],
    clientPermReqs: 'MANAGE_ROLES',
    subcommands: {
        add: {
            async execute(message, parsed, tag) {
                const {role} = parsed;

                if (!role.editable)
                    throw new ActionUntakeableError('autorole add', `\`${role.name}\` too high in hierarchy, cannot be assigned to others.`);
                // Shaky
                if (isInField(tag, 'autoroles', role.id))
                    throw new IllegalArgumentError('autorole add', `\`${role.name}\` already in autorole.`);

                await addToField(tag, 'autoroles', role.id);

                await log(message.client, message.guild!, {
                    id: tag.logchannel, color: 0xf6b40c, author: author(message).tag, authorIcon: author(message).displayAvatarURL(),
                    desc: `**\`${role.name}\` added to this server's autorole by ${author(message).tag} in ${message.channel}**${message instanceof Message ? `\n[Jump to message](${message.url})` : ''}`
                });
                await replyEmbed(message, success().setDescription(`Added ${role} to server autorole.`));
            }
        },
        remove: {
            async execute(message, parsed, tag) {
                const {role} = parsed;

                // Shaky
                if (!isInField(tag, 'autoroles', role.id))
                    throw new IllegalArgumentError('autorole remove', `${role} not in autorole`);

                await removeFromField(tag, 'autoroles', role.id);

                await log(message.client, message.guild!, {
                    id: tag.logchannel, color: 0xf6b40c, author: author(message).tag, authorIcon: author(message).displayAvatarURL(),
                    desc: `**\`${role.name}\` removed from this server's autorole by ${author(message).tag} in ${message.channel}**${message instanceof Message ? `\n[Jump to message](${message.url})` : ''}`
                });
                await replyEmbed(message, success().setDescription(`Removed ${role} from server autorole.`));
            }
        }
    }
});
