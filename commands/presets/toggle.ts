import {Message, TextChannel} from 'discord.js';
import {success} from '../../utils/messages';
import {Guild} from '../../models/Guild';

import IllegalArgumentError from '../../errors/IllegalArgumentError';


export default {
    name: 'toggle',
    description: 'Toggles whether the specific action will be logged.',
    pattern: '[...Presets]',
    examples: ['toggle message_delete', 'toggle message_delete member_join member_leave'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message: Message, parsed: {presets: string[]}, tag: Guild) {
        const presets = parsed.presets;

        let newPresets = [];

        for (let preset of presets) { // Weird glitch where running !toggle without any arguments sets [] to []?
            if (preset === 'all') {
                // If all is given as an argument
                for (let f in tag) {
                    // Only run this on log fields
                    if (f.includes('log_')) {
                        // @ts-ignore
                        const value = tag.getDataValue(f);
                        // @ts-ignore
                        tag.setDataValue(f, !value); // Toggle the field
                        // @ts-ignore
                        newPresets.push(!value);
                    }
                }
                // TODO: make better success message for toggle all
            } else {
                // Otherwise, if it targets a specific field
                const index = `log_${preset}`;
                // @ts-ignore
                const field = tag.getDataValue(index);
                if (typeof field === 'undefined')
                    throw new IllegalArgumentError(this.name, `${preset} not a valid logged action; ` +
                        'Valid logged actions: \`message_delete\`, \`message_delete_bulk\`, \`message_edit\`, \`nickname_change\`, \`member_join\`, \`member_leave\`');

                // @ts-ignore
                tag.setDataValue(index, !field); // Toggle the field
                newPresets.push(!field); // Add the result to the results list
            }
        }

        await tag.save();
        message.channel.send({embeds: [success().setDescription(`\`[${presets.join(', ')}]\`s have been set to \`[${newPresets.join(', ')}]\``)]});
    }
}
