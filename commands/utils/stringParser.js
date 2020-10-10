// https://github.com/ky28059/java-stuff/blob/master/Toolkit/Parser.java

export function parse(src, parseForLeft, parseForRight, startIndex) {
    //find left and right
    const left = src.indexOf(parseForLeft, startIndex);
    if (left === -1) {
        return null;
    }
    const right = src.indexOf(parseForRight, left + parseForLeft.length);
    if (right === -1) {
        return null;
    }

    return src.substring(left + parseForLeft.length, right);
}
