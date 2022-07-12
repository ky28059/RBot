import {createGuildOnlySlashSubCommands} from '../../utils/commands';
import {Channel, TextChannel} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {success} from '../../utils/messages';
import {replyEmbed} from '../../utils/messageUtils';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export const data = new SlashCommandBuilder()
    .setName('set')
    .setDescription('Sets new token data for this server.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(option => option
        .setName('prefix')
        .setDescription('Sets the text command prefix for this server.')
        .addStringOption(option => option
            .setName('prefix')
            .setDescription('The prefix to set')
            .setRequired(true)))
    .addSubcommand(option => option
        .setName('logchannel')
        .setDescription('Sets the logging channel for this server.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel RBot should log in')
            .setRequired(true)))

export default createGuildOnlySlashSubCommands<{prefix: {prefix: string}, logchannel: {channel: Channel}}>({
    data,
    examples: ['set prefix r', 'set logchannel #logs'],
    subcommands: {
        prefix: {
            async execute(message, parsed, tag) {
                const {prefix} = parsed;

                tag.prefix = prefix;
                await tag.save();

                await replyEmbed(message, success().setDescription(`\`prefix\` has been updated to \`${prefix}\`.`));
            }
        },
        logchannel: {
            async execute(message, parsed, tag) {
                const {channel} = parsed;
                const guild = message.guild!;

                if (channel.type !== 'GUILD_TEXT')
                    throw new IllegalArgumentError('set.prefix', '`Channel` must be a text channel.');
                if (!((channel as TextChannel).guild.id === guild.id))
                    throw new IllegalArgumentError('set.prefix', '`Channel` must be within this server.');

                tag.logchannel = channel.id;
                await tag.save();

                await replyEmbed(message, success().setDescription(`\`logchannel\` has been updated to \`#${(channel as TextChannel).name}\`.`));
            }
        }
    }
});
