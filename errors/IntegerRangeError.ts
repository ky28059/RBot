import IllegalArgumentError from './IllegalArgumentError';


// Thrown when a number argument is not within its allowed range.
// TODO: this might be better as `NumberRangeError`?
// TODO: any type-safe way of making sure either lowerBound or upperBound are given?
// TODO: this might be better using an object for lower and upper bound
export default class IntegerRangeError extends IllegalArgumentError {
    constructor (commandName: string, field: string, lowerBound?: number | string, upperBound?: number | string, repeating?: boolean) {
        const suffix = (lowerBound !== undefined && upperBound !== undefined) ? (
            `between ${lowerBound} and ${upperBound}`
        ) : (lowerBound !== undefined) ? (
            `above ${lowerBound}`
        ) : (
            `below ${upperBound}`
        );

        super(commandName, repeating
            ? `All arguments to field \`${field}\` must be ${suffix}.`
            : `Field \`${field}\` must be ${suffix}.`
        );
        this.name = 'RANGE_ERROR';
    }
}
