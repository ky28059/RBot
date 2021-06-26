import fetch from 'node-fetch';
import {MessageEmbed} from 'discord.js';
import he from 'he';


export default {
    name: 'define',
    description: 'Gets the definition(s) of a word from wiktionary.',
    pattern: '<Word>',
    examples: ['define bespoke', 'define mole hill'],
    async execute(message, parsed) {
        const word = parsed.word.toLowerCase();
        const res = await (await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word.replace(/ /g, '_')}`)).json();

        const dictionaryEmbed = new MessageEmbed()
            .setColor(0x333333)

        if (res.title === 'Not found.') {
            dictionaryEmbed.setAuthor('Word not found.');
            return message.channel.send(dictionaryEmbed);
        }

        dictionaryEmbed
            .setTitle(word)
            .setURL(`https://en.wiktionary.org/wiki/${word.replace(/ /g, '_')}`)
            .setFooter(`Requested by ${message.author.tag}`);

        // The structure of the API response seems to be
        // { en: [ ...partsOfSpeech ] }
        // { partOfSpeech: ..., language: ..., definitions: [ ...definitions ] }
        // { definition: ..., parsedExamples?: [ ...examples ], examples?: [ ...examples ] }
        // { example: ... }
        // which is parsed by the loop into partsOfSpeech field titles and definition / example field values
        for (const definition of res.en) {
            let desc = definition.definitions.map((def, i) => {
                let str = `${i + 1}. ${cleanWiktionaryHTMLString(def.definition)}`;
                if (def.parsedExamples)
                    str += '\n' + def.parsedExamples.map(ex => '> ' + cleanWiktionaryHTMLString(ex.example)).join('\n');
                return str;
            }).join('\n');

            // TODO: handle description length overflow
            dictionaryEmbed.addField(definition.partOfSpeech, desc);
        }

        await message.channel.send(dictionaryEmbed);
    }
}

// Clean the unparsed API output into markdown-ready code
function cleanWiktionaryHTMLString(str) {
    return he.decode(str) // decode HTML entities
        .replace(/<\/?i[^>]*>/g, '*') // replace <i> with markdown italics
        .replace(/<\/?b[^>]*>/g, '**') // replace <b> with markdown bold
        .replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2](https://en.wiktionary.org$1)') // replace <a> with markdown link, href in <a>s are assumed to be relative
        .replace(/<li[^>]*>/g, '-') // replace leading <li> with dash
        .replace(/<\/?\w+[^>]*>/g, '') // remove all other html elements (<span>, <ol> and <li>, etc.)
}
