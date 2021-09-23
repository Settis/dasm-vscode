import { isNumber, parseNumber } from "../number";
import * as assert from 'assert';

describe('Number parsing', () => {
    it('Parse binary', () => {
        const text = '%1001';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), 0b1001);
    });
    it('Parse incorrect binary', () => {
        const text = '%6';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), Number.NaN);
    });
    it('Parse octa number', () => {
        const text = '0756';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), 0o756);
    });
    it('Parse incorrect octa', () => {
        const text = '095';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), Number.NaN);
    });
    it('Parse decimal', () => {
        const text = '456';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), 456);
    });
    it('Parse hex', () => {
        const text = '$F5A3';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), 0xF5A3);
    });
    it('Parse invalid hex', () => {
        const text = '$95AZ';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), Number.NaN);
    });
    it('Parse zero', () => {
        const text = '0';
        assert.ok(isNumber(text));
        assert.strictEqual(parseNumber(text), 0);
    });
    it('Non number', () => {
        assert.strictEqual(isNumber('foo'), false);
    });
});