import 'mocha';
import assert from 'assert';

import * as cnab from '../ts/index';

const TEST_CLAIM = {
    bundle: {},  // Ignoring this because no interesting parsing happens to it
    created: "2018-08-30T20:01:23.45600-06:00",
    modified: "2018-09-10T20:01:23.45600+06:00",
    name: "hello",
    revision: "ABCDE",
};

const TEST_CLAIM_JSON = JSON.stringify(TEST_CLAIM, undefined, 2);

function utcTime(year: number, month: number, day: number, hour: number, minute: number, second: number, ms: number): Date {
    const d = new Date();
    d.setUTCFullYear(year, month, day);
    d.setUTCHours(hour, minute, second, ms);
    return d;
}

describe('when parsing claim JSON', () => {

    it('should parse the created time', () => {
        const claim = cnab.Claim.parse(TEST_CLAIM_JSON);
        assert.equal(claim.createdTime.toString(), utcTime(2018, 7, 31, 2, 1, 23, 456).toString());
    });

    it('should parse the modified time', () => {
        const claim = cnab.Claim.parse(TEST_CLAIM_JSON);
        assert.equal(claim.modifiedTime.toString(), utcTime(2018, 8, 10, 14, 1, 23, 456).toString());
    });

});
