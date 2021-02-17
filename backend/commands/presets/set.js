import IllegalArgumentError from '../../errors/IllegalArgumentError.js';

export default {
    name: 'set',
    description: 'Sets new token data for this server.',
    usage: 'set [field] [value]',
    pattern: '[Field] <Args>',
    examples: ['set logchannel #logs', 'set prefix r'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client, tag) {
        const {field, args} = parsed;
        const guild = message.guild;

        let updated; // better way of doing this, there is probably

        switch (field) {
            case 'logchannel':
                // sloppily copy code from argparser in lieu of multiple patterns
                let channelID = args.match(/^<#(\d+)>$/) ? args.match(/^<#(\d+)>$/)[1] : args;
                const channelTarget = client.channels.cache.get(channelID);

                if (!channelTarget)
                    throw new IllegalArgumentError(this.name, '`Channel` must be a valid text channel');
                if (channelTarget.type !== 'text')
                    throw new IllegalArgumentError(this.name, '`Channel` must be a text channel');
                if (!(channelTarget.guild.id === guild.id))
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
        message.channel.send(`Success! ${field} has been updated to ${updated}!`);
    }
}
