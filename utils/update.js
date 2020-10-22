export async function update(guild, Tags) { // Definitely less needed now it feels
    const tag = await Tags.findOne({ where: { guildID: guild.id } });

    if (!tag) {
        // If the tag doesn't exist
        const tag = await Tags.create({
            guildID: guild.id,
        });
        console.log(`Tag ${tag.guildID} added.`);
    }
}
