import {createGuildOnlySlashCommand} from '../../utils/commands';
import {User} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {PermissionFlagsBits} from 'discord-api-types/v10';

// Utilities
import {replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';


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

export default createGuildOnlySlashCommand<{count: number, target?: User}>({
    data,
    examples: 'expunge 80',
    clientPermReqs: 'MANAGE_MESSAGES',
    async execute(message, parsed) {
        const {count, target} = parsed;

        if (!message.channel) return;
        let fetched = await message.channel.messages.fetch({limit: count + 1})
        if (target) fetched = fetched.filter(message => message.author.id === target.id); // Support expunge by user

        [...fetched.values()].forEach(message => {
            if (message.reactions.cache.size > 0) message.reactions.removeAll();
        });
        await replyEmbed(message, success().setDescription(`Expunged ${count} messages.`));
    }
});
