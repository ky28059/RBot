import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export default {
  name: 'toggle',
  guildOnly: true,
  permReqs: 'MANAGE_GUILD',
  async execute(message, parsed) {
    const guild = message.guild;
    const presets = parsed.raw;
    if (!presets) return message.reply('you must specify the logged actions to toggle!');

    const path = `./tokens/${guild.id}.json`; // path and whatnot super finnicky rn
    if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

    const tokenData = await readToken(guild);
    let newPresets = [];

    /* This is a better and more dynamic way of doing things. However, it requires node 14, while my vm runs node 13

    const exists = tokenData[`log${preset}`] ?? 'Doesn\'t exist!' // probably better way of doing this
    if (exists === 'Doesn\'t exist!') return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
    tokenData[`log${preset}`] = !tokenData[`log${preset}`];
    */

    for (let preset of presets) {
      switch (preset) {
        case 'messagedelete':
          tokenData.logmessagedelete = !tokenData.logmessagedelete;
          newPresets.push(tokenData.logmessagedelete);
          break;

        case 'messagedeletebulk':
          tokenData.logmessagedeletebulk = !tokenData.logmessagedeletebulk;
          newPresets.push(tokenData.logmessagedeletebulk);
          break;

        case 'messageedit':
          tokenData.logmessageedit = !tokenData.logmessageedit;
          newPresets.push(tokenData.logmessageedit);
          break;

        case 'nicknamechange':
          tokenData.lognicknamechange = !tokenData.lognicknamechange;
          newPresets.push(tokenData.lognicknamechange);
          break;

        case 'memberjoin':
          tokenData.logmemberjoin = !tokenData.logmemberjoin;
          newPresets.push(tokenData.logmemberjoin);
          break;

        case 'memberleave':
          tokenData.logmemberleave = !tokenData.logmemberleave;
          newPresets.push(tokenData.logmemberleave);
          break;

        default:
          return message.reply(`${preset} is not a valid logged action to toggle! Logged actions: \`messagedelete\`, \`messagedeletebulk\`, \`messageedit\`, \`nicknamechange\`, \`memberjoin\`, \`memberleave\``);
      }
    }

    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Success! \`[${presets.join(', ')}]\`s have been set to \`[${newPresets.join(', ')}]!\``);
  }
}
