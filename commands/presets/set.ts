import {Message, TextChannel} from 'discord.js';
import {success} from '../../utils/messages';
import {Guild} from '../../models/Guild';

import IllegalArgumentError from '../../errors/IllegalArgumentError';


export default {
    name: 'set',
    description: 'Sets new token data for this server.',
    usage: 'set [field] [value]',
    pattern: '[Field] <Args>',
    examples: ['set logchannel #logs', 'set prefix r'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message: Message, parsed: {field: string, args: string}, tag: Guild) {
        const {field, args} = parsed;
        const guild = message.guild!;

        let updated; // better way of doing this, there is probably

        switch (field) {
            case 'logchannel':
                // sloppily copy code from argparser in lieu of multiple patterns
                const id = args.match(/^<#(\d+)>$/);
                let channelID = id ? id[1] : args;
                const channelTarget = message.client.channels.cache.get(channelID);

                if (!channelTarget)
                    throw new IllegalArgumentError(this.name, '`Channel` must be a valid text channel');
                if (channelTarget.type !== 'GUILD_TEXT')
                    throw new IllegalArgumentError(this.name, '`Channel` must be a text channel');
                if (!((channelTarget as TextChannel).guild.id === guild.id))
                    throw new IllegalArgumentError(this.name, '`Channel` must be within this server');

                tag.logchannel = channelTarget.id;
                updated = channelTarget;
                break;

            case 'prefix':
                tag.prefix = args;
                updated = args;
                break;

            default:
                throw new IllegalArgumentError(this.name, `${field} not a valid token field; valid token fields: \`logchannel\`, \`prefix\``);
        }
        await tag.save();
        message.channel.send({embeds: [success().setDescription(`\`${field}\` has been updated to \`${updated}\``)]});
    }
}
