import {CommandInteraction, Message, MessageEmbed} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';
import he from 'he';
import {author, pagedMessage, reply} from '../../utils/messageUtils';


// The structure of the API response seems to be
// { en?: [ ...partsOfSpeech ], fr?: [ ...partsOfSpeech ], ja?: [ ...partsOfSpeech ], ... }
// { partOfSpeech: ..., language: ..., definitions: [ ...definitions ] }
// { definition: ..., parsedExamples?: [ ...examples ], examples?: [ ...examples ] }
// { example: ... }
// which is parsed by the loop into language specific pages, partsOfSpeech field titles
// and definition / example field values

type LowercaseLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type LangCode = `${LowercaseLetter}${LowercaseLetter}`;

type WiktionaryErrorResponse = {type: string, title?: string, detail: string, instance: string};
type SuccessfulWiktionaryResponse = { [lang in LangCode]?: LangDef[] };
type LangDef = {partOfSpeech: string, language: string, definitions: Definition[]};
type Definition = {definition: string, parsedExamples?: Example[], examples?: Example[]};
type Example = {example: string};

export default {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Gets the definition(s) of a word from wiktionary.')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word to define')
                .setRequired(true)),
    async execute(target: Message | CommandInteraction, parsed: {word: string}) {
        let word = parsed.word;

        // Try once with exact supplied word (allows matching of pages like Markov_chain where capitalization matters)
        let page = encodeURIComponent(word.replace(/ /g, '_'));
        let res: WiktionaryErrorResponse | SuccessfulWiktionaryResponse =
            await (await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${page}`)).json();

        // Try again with lowercased query (allows "Bespoke" to match the actual page, "bespoke")
        if ('title' in res && res.title === 'Not found.') {
            word = word.toLowerCase();
            page = page.toLowerCase();
            res = await (await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${page}`)).json();
        }

        const dictionaryEmbed = new MessageEmbed()
            .setColor(0x333333)

        // If still not found (or some other error occurs), assume the word does not exist
        // Sometimes res.title is omitted from the error response (???) so also check for res.detail
        if ('title' in res || 'detail' in res) {
            dictionaryEmbed.setAuthor(res.title ?? res.detail);
            return reply(target, {embeds: [dictionaryEmbed]});
        }

        dictionaryEmbed
            .setURL(`https://en.wiktionary.org/wiki/${page}`)
            .setFooter(`Requested by ${author(target).tag}`);

        const pages = [];
        for (const lang of Object.keys(res)) {
            const langEmbed = new MessageEmbed(dictionaryEmbed)
                .setTitle(`${word} (${lang})`);

            // A hacky workaround, but TS doesn't recognize that all strings returned by Object.keys are valid to index with
            for (const definition of res[lang as LangCode]!) {
                let desc = definition.definitions.map((def, i) => {
                    let str = `${i + 1}. ${cleanWiktionaryHTMLString(def.definition)}`;
                    if (def.parsedExamples)
                        str += '\n' + def.parsedExamples.map(ex => {
                            // Check if the entire example is parsed away by the cleaning function before returning it as valid
                            const parsed = cleanWiktionaryHTMLString(ex.example);
                            if (parsed) return '> ' + parsed;
                        }).join('\n');
                    return str;
                }).join('\n');

                // TODO: handle description length overflow
                langEmbed.addField(definition.partOfSpeech, desc);
            }
            pages.push(langEmbed);
        }

        await pagedMessage(target, pages);
    }
}

// Clean the unparsed API output into markdown-ready code
function cleanWiktionaryHTMLString(str: string) {
    return he.decode(str) // decode HTML entities
        .replace(/<\/?i[^>]*>/g, '*') // replace <i> with markdown italics
        .replace(/<\/?b[^>]*>/g, '**') // replace <b> with markdown bold
        .replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2](https://en.wiktionary.org$1)') // replace <a> with markdown link, href in <a>s are assumed to be relative
        .replace(/<link[^>]*>/g, '') // remove <link>, hackily allowing <li> parsing to work
        .replace(/<li[^>]*>/g, '-') // replace leading <li> with dash
        .replace(/<\/?\w+[^>]*>/g, '') // remove all other html elements (<span>, <ol> and <li>, etc.)
}
