export default {
    name: 'autorole',
    description: 'Adds / removes roles from the autorole (to be added to new members upon join).',
    usage: 'autorole [add / remove] @[role]',
    examples: ['autorole add @verified', 'autorole remove @moderator'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    clientPermReqs: 'MANAGE_ROLES',
    async execute(message, parsed, client) {
        const roleTarget = parsed.roleTarget;
        const guild = message.guild;
        const action = parsed.first;

        if (!roleTarget) return message.reply('you must specify a role to add/remove from autorole!');
        if (!roleTarget.editable) return message.reply('that role is too high up in the hierarchy! Please adjust it so that my highest role is above that role!');
        if (!action) return message.reply('you must specify what to do with that role!');

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });

        switch (action) {
            case 'add':
                if (tag.autoroles && tag.autoroles.includes(roleTarget.id)) return message.reply("that role has already been added to autorole!");
                tag.autoroles += roleTarget.id + ' ';
                break;

            case 'remove':
                if (tag.autoroles && !tag.autoroles.includes(roleTarget.id)) return message.reply("that role has not been added to autorole!");
                tag.autoroles = tag.autoroles.replace(`${roleTarget.id} `, '');
                break;

            default:
                return message.reply(`${action} is not a valid action!`);
        }
        // TODO: log this
        await tag.save();
        message.channel.send(`Success! Autorole has been updated!`);
    }
}