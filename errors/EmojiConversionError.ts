import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `GuildEmoji` receives a value not resolvable to `GuildEmoji`.
export default class EmojiConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'GuildEmoji', repeating);
        this.name = 'EMOJI_CONVERSION_ERROR';
    }
}
