import {createGuildOnlySlashCommand, createSlashCommand} from '../../util/commands';
import {Message, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';


export const data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk deletes the specified amount of messages in the channel, or only messages sent by a given user.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option
        .setName('count')
        .setDescription('The number of messages to purge.')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option => option
        .setName('target')
        .setDescription('The person to delete messages from.'))

export default createGuildOnlySlashCommand<{count: number, target?: User}>({
    data,
    clientPermReqs: 'ManageMessages',
    async execute(message, parsed) {
        const {count, target} = parsed;

        // Delete the original message so that more messages can be bulk deleted
        if (message instanceof Message) await message.delete()

        if (!message.channel || message.channel.isDMBased()) return;
        let fetched = await message.channel.messages.fetch({limit: count});
        if (target) fetched = fetched.filter(message => message.author.id === target.id); // Support purge by user

        const deleted = await message.channel.bulkDelete(fetched, true);
        await replyEmbed(message, success().setDescription(`Purged ${deleted.size} messages`));
    }
});
