import {CommandInteraction, Message, User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import IntegerConversionError from '../../errors/IntegerConversionError';
import IntegerRangeError from '../../errors/IntegerRangeError';


export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes the specified amount of messages in the channel, or only messages sent by a given user.')
        .addIntegerOption(option => option
            .setName('count')
            .setDescription('The number of messages to purge')
            .setRequired(true))
        .addUserOption(option => option
            .setName('target')
            .setDescription('The person to delete messages from')),
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message: Message | CommandInteraction, parsed: {count: number, target?: User}) {
        const {count, target} = parsed;

        if (isNaN(count) || count % 1 !== 0)
            throw new IntegerConversionError('purge', 'Count');
        if (count < 1 || count > 100)
            throw new IntegerRangeError('purge', 'Count', 1, 100);

        // Delete the original message so that more messages can be bulk deleted
        if (message instanceof Message) await message.delete()

        if (!message.channel) return;
        let fetched = await message.channel.messages.fetch({limit: count});
        if (target) fetched = fetched.filter(message => message.author.id === target.id); // Support purge by user

        if (!('bulkDelete' in message.channel)) return;
        const deleted = await message.channel.bulkDelete(fetched, true);
        await replyEmbed(message, success({desc: `Purged ${deleted.size} messages`}));
    }
}
