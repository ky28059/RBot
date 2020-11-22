export default {
    name: 'toggle',
    description: 'Toggles whether the specific action will be logged.',
    usage: 'toggle [action or actions]',
    examples: ['toggle message_delete', 'toggle message_delete member_join member_leave'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const presets = parsed.raw;
        if (!presets) return message.reply('you must specify the logged actions to toggle!');

        const tag = await client.GuildTags.findOne({ where: { guildID: guild.id } });
        let newPresets = [];

        for (let preset of presets) { // Weird glitch where running !toggle without any arguments sets [] to []?
            const field = tag[`log_${preset}`];
            if (typeof field === 'undefined') return message.reply('you must specify a valid logged action to toggle! Logged actions: `message_delete`, `message_delete_bulk`, `message_edit`, `nickname_change`, `member_join`, `member_leave`');
            tag[`log_${preset}`] = !tag[`log_${preset}`];
            newPresets.push(tag[`log_${preset}`]);
        }

        await tag.save();
        message.channel.send(`Success! \`[${presets.join(', ')}]\`s have been set to \`[${newPresets.join(', ')}]!\``);
    }
}
