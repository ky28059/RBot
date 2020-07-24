// https://github.com/ky28059/java-stuff/blob/master/Toolkit/Parser.java
// not sure why I translated this since I don't actually use it
function parse(src, parseForLeft, parseForRight, startIndex) {
  //find left and right
  const left = src.indexOf(parseForLeft, startIndex);
  if (left == -1) {
  	return null;
  }
  const right = src.indexOf(parseForRight, left + parseForL.length);
  if (right == -1) {
  	return null;
  }

  const sub = src.substring(left + parseForL.length(), right);
  return sub;
}
module.exports = parse;
