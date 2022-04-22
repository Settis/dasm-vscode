import assert = require("assert");
import { copy } from "./objectCopy";

describe('Testing object copy', () => {
    it('copy the same', () => {
        const obj = {
            foo: 'bar',
            baz: 2
        };
        testCopy(obj, obj, obj);
    });
    it('copy empty', () => {
        testCopy({}, {}, {});
    });
    it('empty mask', () => {
        testCopy({
            foo: "bar",
            baz: 1
        }, {}, {});
    });
    it('mask got extra', () => {
        testCopy({}, {foo: 4}, {foo: undefined});
    });
    it('nested objects', () => {
        testCopy({
            foo: { bar: 4, baz: 5 }
        }, {
            foo: { baz: 1 }
        }, {
            foo: { baz: 5 }
        });
    });
    it('simple array', () => {
        testCopy({
            foo: [1, 2, 3]
        }, {
            foo: [5]
        }, {
            foo: [1, 2, 3]
        });
    });
    it('array with objects', () => {
        testCopy({
            foo: [{f: 2, w: 4}, {f: 3, d: 5}]
        }, {
            foo: [{f: 1}]
        }, {
            foo: [{f: 2}, {}]
        });
    });
    it('array with differen objects', () => {
        testCopy({
            foo: [{a:1, b:2, c:0}, {c:3, d: 4, a:0}]
        }, {
            foo: [{a:0, b:0}, {c:0, d: 0}]
        }, {
            foo: [{a:1, b:2}, {c:3, d: 4}]
        });
    });
    it('with null fields', () => {
        testCopy({
            foo: null
        },{
            foo: null
        },{
            foo: null
        });
    });
});

function testCopy(orig: any, mask: any, result: any) {
    assert.deepStrictEqual(copy(orig, mask), result);
}
