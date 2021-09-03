import {CommandInteraction, Message, User} from 'discord.js';
import {success} from '../../utils/messages';

// Errors
import IntegerConversionError from '../../errors/IntegerConversionError';
import IntegerRangeError from '../../errors/IntegerRangeError';
import {reply} from "../../utils/messageUtils";
import {SlashCommandBuilder} from "@discordjs/builders";


export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes the specified amount of messages in the channel, or only messages sent by a given user.')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('The number of messages to purge')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person to delete messages from')),
    guildOnly: true,
    permReqs: 'MANAGE_MESSAGES',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message: Message | CommandInteraction, parsed: {count: number, target?: User}) {
        let count = parsed.count;
        const target = parsed.target;

        if (isNaN(count) || count % 1 !== 0)
            throw new IntegerConversionError('purge', 'Count');
        if (count < 1 || count > 100)
            throw new IntegerRangeError('purge', 'Count', 1, 100);

        // Delete the original message so that more messages can be bulk deleted
        if (message instanceof Message) await message.delete()

        let fetched = await message.channel!.messages.fetch({limit: count});

        // Support purge by user
        if (target)
            fetched = fetched.filter(message => message.author.id === target.id);

        if (!('bulkDelete' in message.channel!)) return;
        await message.channel.bulkDelete(fetched)
        await reply(message, {embeds: [success({desc: `Purged ${fetched.size} messages`})]})
    }
}
