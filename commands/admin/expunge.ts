import {createSlashCommand} from '../../utils/parseCommands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IntegerRangeError from '../../errors/IntegerRangeError';


export const data = new SlashCommandBuilder()
    .setName('expunge')
    .setDescription('Removes all reactions from the specified amount of messages in the channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option
        .setName('count')
        .setDescription('The number of messages to expunge.')
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true))
    .addUserOption(option => option
        .setName('target')
        .setDescription('The person to expunge reactions from.'))

export default createSlashCommand<{count: number, target?: User}, true>(
    data,
    async (message, parsed) => {
        const {count, target} = parsed;

        // TODO: see todo in `purge.ts`
        if (count < 1 || count > 99)
            throw new IntegerRangeError('expunge', 'count', 1, 99);

        if (!message.channel) return;
        let fetched = await message.channel.messages.fetch({limit: count + 1})
        if (target) fetched = fetched.filter(message => message.author.id === target.id); // Support expunge by user

        [...fetched.values()].forEach(message => {
            if (message.reactions.cache.size > 0) message.reactions.removeAll();
        });
        await replyEmbed(message, success().setDescription(`Expunged ${count} messages.`));
    }, {
        examples: 'expunge 80',
        clientPermReqs: 'MANAGE_MESSAGES',
    }
);
