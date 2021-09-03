// JSON offloader for preserving server presets between SQL structure changes
// offload offloads the JSON stringified data into a temporary tokens directory,
// while onload interprets the JSON values and inserts it into the new SQL structure

import {promises} from 'fs';
const {writeFile, readFile, readdir} = promises;
import {Guild} from '../models/Guild';


export async function offload() {
    (await Guild.findAll()).forEach(tag => writeFile(`./tokens/${tag.guildID}.json`, JSON.stringify(tag)));
}

export async function onload() {
    const tokens = (await readdir('./tokens')).filter(file => file.endsWith('.json'));
    for (const file of tokens) {
        const token = JSON.parse(await readFile(`./tokens/${file}`, 'utf8'));

        // Define custom onload instructions here

        await Guild.create({
            ...token
        })
    }
}
