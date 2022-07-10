import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `Role` receives a value not resolvable to `Role`.
export default class RoleConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'Role', repeating);
        this.name = 'ROLE_CONVERSION_ERROR';
    }
}
