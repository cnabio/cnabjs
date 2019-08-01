import { Bundle } from "./bundle-manifest";
import * as ajv from 'ajv';
import { cantHappen } from "./utils/never";

export interface Valid {
    readonly isValid: true;
}

export interface Invalid {
    readonly isValid: false;
    readonly reason: string;
}

export type Validity = Valid | Invalid;

export interface BundleParameterValidator {
    validate(parameter: string, value: string | number | boolean): Validity;
    validateText(parameter: string, valueText: string): Validity;
}

export class Validator implements BundleParameterValidator {
    static for(bundle: Bundle): BundleParameterValidator {
        return new Validator(bundle);
    }

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
                const intValue = Number.parseInt(valueText, 10);
                if (isNaN(intValue)) {
                    return { isValid: false, reason: 'The value must be a whole number' };
                }
                return this.validate(parameter, intValue);
            case 'number':
                const floatValue = Number.parseFloat(valueText);
                if (isNaN(floatValue)) {
                    return { isValid: false, reason: 'The value must be a number' };
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
