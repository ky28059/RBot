// For making sure messages don't exceed discord's 2000 character limit

export function truncateMessage(string, chars) {
    if (!(string.length > 2000 - chars)) return string;

    const diff = string.length - 2000;
    const truncateMessage = `\n[String too long, truncated ${diff + chars} characters]`;
    const from2000 = chars + truncateMessage.length + 1;

    const truncated = string.slice(0, 2000 - from2000) + ` ${truncateMessage}`;
    return truncated;
}