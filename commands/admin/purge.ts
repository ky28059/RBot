import {createSlashCommand} from '../../utils/parseCommands';
import {Message, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IntegerRangeError from '../../errors/IntegerRangeError';


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

export default createSlashCommand<{count: number, target?: User}, true>(
    data,
    async (message, parsed) => {
        const {count, target} = parsed;

        // TODO: when discord slash command builders start supporting `minValue` and `maxValue`, this will be unnecessary
        if (count < 1 || count > 100)
            throw new IntegerRangeError('purge', 'Count', 1, 100);

        // Delete the original message so that more messages can be bulk deleted
        if (message instanceof Message) await message.delete()

        if (!message.channel) return;
        let fetched = await message.channel.messages.fetch({limit: count});
        if (target) fetched = fetched.filter(message => message.author.id === target.id); // Support purge by user

        if (!('bulkDelete' in message.channel)) return;
        const deleted = await message.channel.bulkDelete(fetched, true);

        await replyEmbed(message, success().setDescription(`Purged ${deleted.size} messages`));
    }, {
        clientPermReqs: 'MANAGE_MESSAGES'
    }
);
