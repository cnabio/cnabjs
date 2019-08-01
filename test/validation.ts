import 'mocha';
import assert from 'assert';

import * as cnab from '../ts/index';
import { Validator, Validity } from '../ts/index';

const TEST_BUNDLE: cnab.Bundle = {
    name: 'test',
    schemaVersion: 'v1',
    version: '1.0.0',
    invocationImages: [],

    definitions: {
        simpleString: { type: 'string' },
        lengthyString: { type: 'string', minLength: 4, maxLength: 7 },
        simpleInt: { type: 'integer' },
        constrainedInt: { type: 'integer', minimum: 1, maximum: 100 },
        simpleFloat: { type: 'number' },
        simpleBool: { type: 'boolean' },
    },

    parameters: {
        simpleString: { definition: 'simpleString', destination: {} },
        lengthyString: { definition: 'lengthyString', destination: { } },
        simpleNum: { definition: 'simpleInt', destination: {} },
        constrainedNum: { definition: 'constrainedInt', destination: { } },
        simpleFloat: { definition: 'simpleFloat', destination: {} },
        simpleBool: { definition: 'simpleBool', destination: {} },
        noDef: { definition: 'doesnt have one', destination: { } },
    },
};

const TEST_VALIDATOR = Validator.for(TEST_BUNDLE);

function expectValid(validity: Validity) {
    if (!validity.isValid) {
        assert.fail(`should have been valid but '${validity.reason}'`);
    }
}

function expectInvalid(validity: Validity) {
    if (validity.isValid) {
        assert.fail(`should NOT have been valid`);
    }
}

describe('a string parameter', () => {

    it('should accept a string value', () => {
        const validity = TEST_VALIDATOR.validate('simpleString', 'some text');
        expectValid(validity);
    });

    it('should not accept a numeric value', () => {
        const validity = TEST_VALIDATOR.validate('simpleString', 123);
        expectInvalid(validity);
    });

    it('should validate against constraints in the schema', () => {
        // NOTE: purpose of this is not to exercise JSON Schema - we lean on ajv for that.
        // It is solely to confirm that we are successfully passing the schema into ajv.
        const validity6 = TEST_VALIDATOR.validate('lengthyString', '6chars');
        expectValid(validity6);
        const validity3 = TEST_VALIDATOR.validate('lengthyString', '3ch');
        expectInvalid(validity3);
        const validity12 = TEST_VALIDATOR.validate('lengthyString', '12characters');
        expectInvalid(validity12);
    });

    it('should accept a string value via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleString', 'some text');
        expectValid(validity);
    });

});

describe('an integer parameter', () => {

    it('should accept an integer value', () => {
        const validity = TEST_VALIDATOR.validate('simpleNum', 123);
        expectValid(validity);
    });

    it('should not accept a value with a fractional part', () => {
        const validity = TEST_VALIDATOR.validate('simpleNum', 123.5);
        expectInvalid(validity);
    });

    it('should not accept a string value', () => {
        const validity = TEST_VALIDATOR.validate('simpleNum', '123');
        expectInvalid(validity);
    });

    it('should validate against constraints in the schema', () => {
        // NOTE: purpose of this is not to exercise JSON Schema - we lean on ajv for that.
        // It is solely to confirm that we are successfully passing the schema into ajv.
        const validity70 = TEST_VALIDATOR.validate('constrainedNum', 70);
        expectValid(validity70);
        const validity0 = TEST_VALIDATOR.validate('constrainedNum', 0);
        expectInvalid(validity0);
        const validity150 = TEST_VALIDATOR.validate('constrainedNum', 150);
        expectInvalid(validity150);
    });

    it('should accept a stringised number via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleNum', '123');
        expectValid(validity);
    });

    it('should not accept a stringised non-number via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleNum', 'xyz123');
        expectInvalid(validity);
    });

});

describe('a number parameter', () => {

    it('should accept an integer value', () => {
        const validity = TEST_VALIDATOR.validate('simpleFloat', 123);
        expectValid(validity);
    });

    it('should accept a value with a fractional part', () => {
        const validity = TEST_VALIDATOR.validate('simpleFloat', 123.5);
        expectValid(validity);
    });

    it('should not accept a string value', () => {
        const validity = TEST_VALIDATOR.validate('simpleFloat', '123');
        expectInvalid(validity);
    });

    it('should accept a stringised number via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleFloat', '123');
        expectValid(validity);
    });

    it('should not accept a stringised non-number via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleFloat', 'xyz123');
        expectInvalid(validity);
    });

});

describe('a boolean parameter', () => {

    it('should accept true', () => {
        const validity = TEST_VALIDATOR.validate('simpleBool', true);
        expectValid(validity);
    });

    it('should accept false', () => {
        const validity = TEST_VALIDATOR.validate('simpleBool', false);
        expectValid(validity);
    });

    it('should not accept a string value', () => {
        const validity = TEST_VALIDATOR.validate('simpleBool', 'true');
        expectInvalid(validity);
    });

    it('should accept a stringised boolean via the text API', () => {
        const validityT = TEST_VALIDATOR.validateText('simpleBool', 'true');
        expectValid(validityT);
        const validityF = TEST_VALIDATOR.validateText('simpleBool', 'false');
        expectValid(validityF);
    });

    it('should not accept a stringised non-boolean via the text API', () => {
        const validity = TEST_VALIDATOR.validateText('simpleBool', 'FILE_NOT_FOUND');
        expectInvalid(validity);
    });

});

describe('a parameter with no definition', () => {

    it('should fail validation', () => {
        const validity = TEST_VALIDATOR.validate('noDef', 123);
        expectInvalid(validity);
    });

});

describe('an undefined parameter', () => {

    it('should fail validation', () => {
        const validity = TEST_VALIDATOR.validate('there is no parameter with this name', 123);
        expectInvalid(validity);
    });

});

const PARAMETERLESS_BUNDLE: cnab.Bundle = {
    name: 'test',
    schemaVersion: 'v1',
    version: '1.0.0',
    invocationImages: [],
    definitions: {
        foo: { type: 'integer' }
    }
};

const DEFINITIONLESS_BUNDLE: cnab.Bundle = {
    name: 'test',
    schemaVersion: 'v1',
    version: '1.0.0',
    invocationImages: [],
    parameters: {
        foo: { definition: 'foo', destination: {} }
    }
};

describe('if the bundle has no...', () => {

    it('definitions, parameters should fail validation', () => {
        const validity = Validator.for(DEFINITIONLESS_BUNDLE).validate('foo', 123);
        expectInvalid(validity);
    });

    it('parameters, parameters should fail validation', () => {
        const validity = Validator.for(PARAMETERLESS_BUNDLE).validate('foo', 123);
        expectInvalid(validity);
    });

});
