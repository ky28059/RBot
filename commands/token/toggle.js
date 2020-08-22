import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function toggle(message, guild, preset) {
  if (!guild.member(message.author).hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // TODO: require a different perm for this command
  if (!preset) return message.reply('you must specify the logged action to toggle!');

  const path = `./tokens/${guild.id}.json`; // path and whatnot super finnicky rn
  if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

  const tokenData = await readToken(guild);

  switch (preset) { // TODO: definitely more efficient way of doing this
    case 'messagedelete':
      tokenData.logmessagedelete = !tokenData.logmessagedelete;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Message Deletes\` have been set to ${tokenData.logmessagedelete}!`);
      break;

    case 'messagedeletebulk':
      tokenData.logmessagedeletebulk = !tokenData.logmessagedeletebulk;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Bulk Message Deletes\` have been set to ${tokenData.logmessagedeletebulk}!`);
      break;

    case 'messageedit':
      tokenData.logmessageedit = !tokenData.logmessageedit;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Message Updates\` have been set to ${tokenData.logmessageedit}!`);
      break;

    case 'nicknamechange':
      tokenData.lognicknamechange = !tokenData.lognicknamechange;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Nickname Changes\` have been set to ${tokenData.lognicknamechange}!`);
      break;

    case 'memberjoin':
      tokenData.logmemberjoin = !tokenData.logmemberjoin;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Member Joins\` have been set to ${tokenData.logmemberjoin}!`);
      break;

    case 'memberleave':
      tokenData.logmemberleave = !tokenData.logmemberleave;
      await writeFile(path, JSON.stringify(tokenData));
      message.channel.send(`Success! \`Member Leaves\` have been set to ${tokenData.logmemberleave}!`);
      break;

    default:
      return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
  }
}
