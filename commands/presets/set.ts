import {createGuildOnlySlashSubCommands} from '../../util/commands';
import {Channel, ChannelType} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utils
import {success} from '../../util/messages';
import {replyEmbed} from '../../util/messageUtils';

// Errors
import IllegalArgumentError from '../../errors/IllegalArgumentError';


export const data = new SlashCommandBuilder()
    .setName('set')
    .setDescription('Sets new token data for this server.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(command => command
        .setName('prefix')
        .setDescription('Sets the text command prefix for this server.')
        .addStringOption(option => option
            .setName('prefix')
            .setDescription('The prefix to set.')
            .setRequired(true)))
    .addSubcommand(command => command
        .setName('logchannel')
        .setDescription('Sets the logging channel for this server.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel RBot should log in.')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildNews, ChannelType.GuildPublicThread, ChannelType.GuildNewsThread, ChannelType.GuildPrivateThread)
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

                // TODO: add check for whether RBot can speak in the channel
                if (!channel.isTextBased())
                    throw new IllegalArgumentError('set logchannel', '`channel` must be a text-based channel.');
                if (channel.isDMBased())
                    throw new IllegalArgumentError('set logchannel', '`channel` cannot be a DM.');
                if (channel.guild.id !== guild.id)
                    throw new IllegalArgumentError('set logchannel', '`channel` must be within this server.');

                tag.logchannel = channel.id;
                await tag.save();

                await replyEmbed(message, success().setDescription(`\`logchannel\` has been updated to \`#${channel.name}\`.`));
            }
        }
    }
});
