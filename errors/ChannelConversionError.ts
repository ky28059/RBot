import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `Channel` receives a value not resolvable to `Channel`.
export default class ChannelConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'Channel', repeating);
        this.name = 'CHANNEL_CONVERSION_ERROR';
    }
}
