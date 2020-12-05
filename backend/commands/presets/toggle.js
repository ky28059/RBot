export default {
    name: 'toggle',
    description: 'Toggles whether the specific action will be logged.',
    usage: 'toggle [action or actions]',
    examples: ['toggle message_delete', 'toggle message_delete member_join member_leave'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const presets = parsed.raw;
        if (!presets) return message.reply('you must specify the logged actions to toggle!');

        let newPresets = [];

        for (let preset of presets) { // Weird glitch where running !toggle without any arguments sets [] to []?
            if (preset === 'all') {
                // If all is given as an argument
                for (let f in tag.dataValues) {
                    // Only run this on log fields
                    if (f.includes('log_')) {
                        tag[f] = !tag[f]; // Toggle the field
                        newPresets.push(tag[f]);
                    }
                }
                // TODO: make better success message for toggle all
            } else {
                // Otherwise, if it targets a specific field
                const field = tag[`log_${preset}`];
                if (typeof field === 'undefined') return message.reply('you must specify a valid logged action to toggle! Logged actions: `message_delete`, `message_delete_bulk`, `message_edit`, `nickname_change`, `member_join`, `member_leave`');
                tag[`log_${preset}`] = !tag[`log_${preset}`]; // Toggle the field
                newPresets.push(tag[`log_${preset}`]); // Add the result to the results list
            }
        }

        await tag.save();
        message.channel.send(`Success! \`[${presets.join(', ')}]\`s have been set to \`[${newPresets.join(', ')}]!\``);
    }
}
