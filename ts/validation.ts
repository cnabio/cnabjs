import { Bundle } from "./bundle-manifest";
import * as ajv from 'ajv';
import { cantHappen } from "./utils/never";

/**
 * Indicates that a parameter value is valid according to its schema.
 */
export interface Valid {
    /**
     * Indicates that the parameter value is valid according to its schema.
     */
    readonly isValid: true;
}

/**
 * Indicates that a parameter value is invalid according to its schema.
 */
export interface Invalid {
    /**
     * Indicates that a parameter value is invalid according to its schema.
     */
    readonly isValid: false;
    /**
     * The reason the value is invalid.
     */
    readonly reason: string;
}

/**
 * Indicates whether a parameter value is valid according to its schema.
 */
export type Validity = Valid | Invalid;

/**
 * Provides parameter value validation for a bundle.
 */
export interface BundleParameterValidator {
    /**
     * Determines whether a value is a valid value for a parameter.
     * @param parameter The name of the parameter.
     * @param value The value to validate.
     * @returns Whether the value is valid for the parameter.
     */
    validate(parameter: string, value: string | number | boolean): Validity;
    /**
     * Determines whether a text string represents a valid value for a parameter.
     * This is useful when the value comes from a user interface such as a HTML
     * input box.
     * @param parameter The name of the parameter.
     * @param valueText The string to validate.
     * @returns Whether the string represents a valid value for the parameter.
     */
    validateText(parameter: string, valueText: string): Validity;
}

/**
 * Provides parameter value validation for a bundle.
 */
export namespace Validator {
    /**
     * Creates a parameter validator for a CNAB bundle.
     * @param bundle The bundle containing parameter declarations and definitions.
     * @returns An object which can be used to perform parameter validation
     * according to the schema defined in the bundle.
     */
    export function forBundle(bundle: Bundle): BundleParameterValidator {
        return new ValidatorImpl(bundle);
    }
}

class ValidatorImpl implements BundleParameterValidator {

    constructor(private readonly bundle: Bundle) { }

    validate(parameter: string, value: string | number | boolean): Validity {
        const schema = this.parameterSchema(parameter);
        if (!schema) {
            return { isValid: false, reason: 'Bundle does not specify valid parameter values' };  // TODO: more precise error message
        }

        const validator = ajv.default();
        const validate = validator.compile(schema);
        const isValid = !!(validate(value));  // We are never async so we can just breeze past the PromiseLike return
        if (isValid) {
            return { isValid: true };
        }

        const reason = validate.errors!.map((err) => err.message).join(', ');
        return { isValid: false, reason: reason };
    }

    validateText(parameter: string, valueText: string): Validity {
        const schema = this.parameterSchema(parameter);
        if (!schema) {
            return { isValid: false, reason: 'Bundle does not specify valid parameter values' };  // TODO: more precise error message
        }

        const targetType = schema.type || 'string';

        switch (targetType) {
            case 'string':
                return this.validate(parameter, valueText);
            case 'integer':
                const intValue = Number(valueText);
                if (!Number.isInteger(intValue)) {
                    return { isValid: false, reason: 'The value must be a whole number' };
                }
                if (valueText.toLowerCase().includes('e')) {
                    return { isValid: false, reason: 'The value must be a whole number' };  // JS allows scientific notation but CNAB tools are not likely to accept it
                }
                return this.validate(parameter, intValue);
            case 'number':
                const floatValue = Number(valueText);
                if (isNaN(floatValue)) {
                    return { isValid: false, reason: 'The value must be a number' };
                }
                if (valueText.toLowerCase().includes('e')) {
                    return { isValid: false, reason: 'The value must be a number' };  // JS allows scientific notation but CNAB tools are not likely to accept it
                }
                return this.validate(parameter, floatValue);
            case 'boolean':
                const boolValue = valueText.toLowerCase() === 'true' ? true : (valueText.toLowerCase() === 'false' ? false : undefined);
                if (boolValue === undefined) {
                    return { isValid: false, reason: 'The value must be either "true" or "false"' };
                }
                return this.validate(parameter, boolValue);
        }

        return cantHappen(targetType);
    }

    private parameterSchema(parameter: string) {
        if (!this.bundle.parameters || !this.bundle.definitions) {
            return undefined;
        }
        const parameterInfo = this.bundle.parameters[parameter];
        if (!parameterInfo) {
            return undefined;
        }
        const definition = this.bundle.definitions[parameterInfo.definition];
        return definition;
    }
}
