import * as assert from 'assert';
import { DASM_LEXER } from '../../../parser/cst/lexer';

describe('CST lexer tests', () => {
    it('recognize words and spaces', () => {
        checkTokens(
            'foo bar',
            ['foo', ' ', 'bar']
        );
    });
    it('recognize line with inderect addressing and comment', () => {
        checkTokens(
            'LABEL   CMD ARG,X       ; Comment',
            ['LABEL', '   ', 'CMD', ' ', 'ARG', ',X', '       ']
        );
    });
    it('recognize string literal', () => {
        checkTokens(
            '    INCLUDE "FILE.ASM"',
            ['    ','INCLUDE', ' ', '"FILE.ASM"']
        );
    });
    it('recognize Immediate command', () => {
        checkTokens(
            '  LDX #$44',
            ['  ', 'LDX', ' ', '#', '$44']
        );
    });
    it('recognize local label', () => {
        checkTokens(
            '.FOO:',
            ['.FOO', ':']
        );
    });
    it('recognize indirect command', () => {
        checkTokens(
            '  LDX ($44),Y',
            ['  ', 'LDX', ' ', '(', '$44', '),Y']
        );
    });
    it('recognize string literal with spaces', () => {
        checkTokens(
            '  some "foo bar"',
            ['  ', 'some', ' ', '"foo bar"']
        );
    });
    it('recognize strings and comments', () => {
        checkTokens(
            ' it "the string" ; Comment with "string"',
            [' ', 'it', ' ', '"the string"', ' ']
        );
    });
    it('recognize numbers', () => {
        checkTokens(
            ' %1001 0123 456 $FF',
            [' ', '%1001', ' ', '0123', ' ', '456', ' ', '$FF']
        );
    });
    it('recognize identifiers statred/ended with X/Y', () => {
        checkTokens(' X Y XOOY YOOX ', [' ', 'X', ' ', 'Y', ' ', 'XOOY', ' ', 'YOOX', ' ']);
    });
    it('recognize macros arguments', () => {
        checkTokens('{1}', ['{', '1', '}']);
    });
    it('recognize char literal', () => {
        checkTokens("'f,oo", ["'f", ',', 'oo']);
    });
    it('recognize assignment', () => {
        checkTokens('foo = 3', ['foo', ' ', '=', ' ', '3']);
    });
    it('cut comment', () => {
        checkTokens(' /* foo */ ', [' ', ' ']);
    });
    it('recognize multiline comment', () => {
        checkTokens('/* some \n second line \n */', []);
    });
    it('recognize macros with underscore', () => {
        checkTokens('  IF_EQ ', ['  ', 'IF_EQ', ' ']);
    });
    it('recognize Windows line endings', () => {
        checkNewLineSeparator('\r\n');
    });
    it('recognize MacOS line endings', () => {
        checkNewLineSeparator('\r');
    });
    it('recognize Unix line endings', () => {
        checkNewLineSeparator('\n');
    });
});

function checkTokens(text: string, expectedTokens: string[]) {
    const tokens = DASM_LEXER.tokenize(text);
    assert.deepStrictEqual(tokens.errors, []);
    assert.deepStrictEqual(tokens.tokens.map(it => it.image), expectedTokens);
}

function checkNewLineSeparator(text: string) {
    const tokens = DASM_LEXER.tokenize(text);
    assert.deepStrictEqual(tokens.errors, []);
    assert.deepStrictEqual(tokens.tokens.length, 1);
    assert.deepStrictEqual(tokens.tokens[0].tokenType.name, 'newLineSeparator');
}
