import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export default {
  name: 'toggle',
  guildOnly: true,
  permReqs: 'MANAGE_GUILD',
  async execute(message, args) {
    const guild = message.guild;
    const preset = args[0];
    if (!preset) return message.reply('you must specify the logged action to toggle!');

    const path = `./tokens/${guild.id}.json`; // path and whatnot super finnicky rn
    if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

    const tokenData = await readToken(guild);
    let newPreset;

    /* This is a better and more dynamic way of doing things. However, it requires node 14, while my vm runs node 13

    const exists = tokenData[`log${preset}`] ?? 'Doesn\'t exist!' // probably better way of doing this
    if (exists === 'Doesn\'t exist!') return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
    tokenData[`log${preset}`] = !tokenData[`log${preset}`];
    */


    switch (preset) {
      case 'messagedelete':
        tokenData.logmessagedelete = !tokenData.logmessagedelete;
        newPreset = tokenData.logmessagedelete;
        break;

      case 'messagedeletebulk':
        tokenData.logmessagedeletebulk = !tokenData.logmessagedeletebulk;
        newPreset = tokenData.logmessagedeletebulk;
        break;

      case 'messageedit':
        tokenData.logmessageedit = !tokenData.logmessageedit;
        newPreset = tokenData.logmessageedit;
        break;

      case 'nicknamechange':
        tokenData.lognicknamechange = !tokenData.lognicknamechange;
        newPreset = tokenData.lognicknamechange;
        break;

      case 'memberjoin':
        tokenData.logmemberjoin = !tokenData.logmemberjoin;
        newPreset = tokenData.logmemberjoin;
        break;

      case 'memberleave':
        tokenData.logmemberleave = !tokenData.logmemberleave;
        newPreset = tokenData.logmemberleave;
        break;

      default:
        return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
    }

    await writeFile(path, JSON.stringify(tokenData));
    message.channel.send(`Success! \`${preset}\`s have been set to ${newPreset}!`);
  }
}
