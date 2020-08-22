import {readToken} from '../utils/tokenManager.js';
import {readFile, writeFile} from '../../fileManager.js';
import fs from 'fs';

export async function update(message, guild) {
  const exTokenContents = await readFile('./tokens/example.json');
  const exTokenData = JSON.parse(exTokenContents); // my variable names are so horrible

  let tokenData = await readToken(guild);
  const tokenDataKeys = Object.keys(tokenData);
  const exTokenDataKeys = Object.keys(exTokenData);

  const path = `./tokens/${guild.id}.json`;

  if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
    writeFile(path, exTokenContents)
    message.channel.send('Token generated!');

  } else if (JSON.stringify(tokenDataKeys) != JSON.stringify(exTokenDataKeys)) {
    tokenData = { ...exTokenData, ...tokenData}; // credit to Sean for this fantastically simple but amazing code
    writeFile(path, JSON.stringify(tokenData));
    message.channel.send('Token updated!'); // maybe add in fields so that people know exactly which fields were updated? seems super complicated tho

  } else {
    message.channel.send('Your token is up to date!');
  }
}
