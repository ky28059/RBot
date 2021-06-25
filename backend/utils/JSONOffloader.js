// JSON offloader for preserving server presets between SQL structure changes
// offload offloads the JSON stringified data into a temporary tokens directory,
// while onload interprets the JSON values and inserts it into the new SQL structure

import {writeFile, readFile, readdir} from 'fs/promises';


export async function offload(tags) {
    (await tags.findAll()).forEach(tag => writeFile(`./tokens/${tag.guildID}.json`, JSON.stringify(tag)));
}

export async function onload(tags) {
    const tokens = readdir('./tokens').filter(file => file.endsWith('.json'));
    for (const file of tokens) {
        const token = JSON.parse(await readFile(`./tokens/${file}`, 'utf8'));

        // Define custom onload instructions here

        await tags.create({
            ...token
        })
    }
}
