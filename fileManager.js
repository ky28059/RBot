// https://github.com/Orbiit/gunn-web-app/blob/master/build.js
// stuck forever in the root folder since write/readFile are relative to it :(
const fs = require('fs');
const path = require('path');


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

module.exports = {readFile, writeFile};
