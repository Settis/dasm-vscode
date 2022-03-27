import * as assert from "assert";
import { AddressMode, NodeType } from "../../../parser/ast/nodes";
import { parseText } from "../../../parser/ast/utils";
import { copy } from "./objectCopy";

describe.only('Correct AST for', () => {
    it('emty text', () => {
        checkAST('', {
                type: NodeType.Line,
                label: null,
                command: null
            });
    });
    it('long line', () => {
        checkAST('                                 ', 
            {
                type: NodeType.Line,
                label: null,
                command: null
            }
        );
    });
    it('Two empty lines', () => {
        checkAST('   \n    ', {
                type: NodeType.Line,
                label: null,
                command: null
            }, {
                type: NodeType.Line,
                label: null,
                command: null
            });
    });
    it('LABEL                            ', () => {
        checkAST('LABEL                            ', {});
    });
    it('.LABEL                            ', () => {
        checkAST('.LABEL                            ', {});
    });
    it('                        ; Comment', () => {
        checkAST('                        ; Comment', {});
    });
    it('LABEL                   ; Comment', () => {
        checkAST('LABEL                   ; Comment', {});
    });
    it('        CMD ARG,X ARG2           ', () => {
        checkAST('        CMD ARG,X ARG2           ', {});
    });
    it('LABEL   CMD             ; Comment', () => {
        checkAST('LABEL   CMD             ; Comment', {});
    });
    it('LABEL   CMD ARG,X       ; Comment', () => {
        checkAST('LABEL   CMD ARG,X       ; Comment', {});
    });
    it('        CMD ARG   ARG2  ; Comment', () => {
        checkAST('        CMD ARG   ARG2  ; Comment', {});
    });
    it('LABEL   CMD ARG,X ARG2  ; Comment', () => {
        checkAST('LABEL   CMD ARG,X ARG2  ; Comment', {});
    });
    it('    INCLUDE "FILE.ASM"', () => {
        checkAST('    INCLUDE "FILE.ASM"', {});
    });
    // Check address parsing
    it('  LDX #$44', () => {
        checkAST('  LDX #$44', {});
    });
    it('  LDX ($44,X)', () => {
        checkAST('  LDX ($44,X)', {});
    });
    it('  LDX ($44),Y', () => {
        checkAST('  LDX ($44),Y', {});
    });
    it('  LDX ($44)', () => {
        checkAST('  LDX ($44)', {});
    });
    it('  LDX $44,X', () => {
        checkAST('  LDX $44,X', {});
    });
    it('  LDX $44,Y', () => {
        checkAST('  LDX $44,Y', {});
    });
});

function checkAST(text: string, ...lines: TestLineNode[]) {
    const ast = parseText('', text);
    const result: TestFileNode = {
        type: NodeType.File,
        lines: lines
    };
    assert.deepStrictEqual(copy(ast, result), result);
}

type TestFileNode = {
    type: NodeType.File,
    lines: TestLineNode[]
}

type TestLineNode = {
    type: NodeType.Line,
    label: TestLabelNode | null,
    command: TestCommandNode | null
}

type TestLabelNode = {
    type: NodeType.Label,
    name: TestStringLiteralNode,
    isLocal: boolean
}

type TestCommandNode = {
    type: NodeType.Command,
    name: TestStringLiteralNode,
    args: TestArgumentNode[]
}

type TestStringLiteralNode = {
    type: NodeType.StringLiteral,
    text: string
}

type TestArgumentNode = {
    type: NodeType.Argument,
    addressMode: AddressMode,
    value: TestStringLiteralNode | TestNumberNode
}

type TestNumberNode = {
    type: NodeType.Number,
    value: number
}
