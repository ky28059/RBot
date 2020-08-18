// https://github.com/Orbiit/gunn-web-app/blob/master/build.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readFile(file) {
  return new Promise((res, rej) => {
    fs.readFile(path.resolve(__dirname, file), 'utf8', (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
}
function writeFile(file, contents) {
  fs.writeFile(path.resolve(__dirname, file), contents, () => {
    console.log(file + ' written')
  });
}

export {readFile, writeFile};
