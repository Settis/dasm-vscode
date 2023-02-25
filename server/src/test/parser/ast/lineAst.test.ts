import { AddressMode, NodeType } from "../../../parser/ast/nodes";
import { checkAST, TestArgumentNode, TestCommandNode, TestLabelNode, TestLineNode } from "./utils";

describe('Correct AST for line', () => {
    it('emty text', () => {
        checkAST('');
    });
    it('long line', () => {
        checkAST('                                 ');
    });
    it('Two empty lines', () => {
        checkAST('   \n    ');
    });
    it('LABEL                            ', () => {
        checkAST('LABEL                            ',
            aLine('LABEL')
        );
    });
    it('.LABEL                            ', () => {
        checkAST('.LABEL                            ',
            aLine('.LABEL')
        );
    });
    it('                        ; Comment', () => {
        checkAST('                        ; Comment');
    });
    it('LABEL                   ; Comment', () => {
        checkAST('LABEL                   ; Comment',
            aLine('LABEL')
        );
    });
    it('        CMD ARG,X,ARG2           ', () => {
        checkAST('        CMD ARG,X,ARG2           ',
            aLine(undefined, 'CMD', anArg('ARG', AddressMode.AddressX), anArg('ARG2'))
        );
    });
    it('LABEL   CMD             ; Comment', () => {
        checkAST('LABEL   CMD             ; Comment',
            aLine('LABEL', 'CMD')
        );
    });
    it('LABEL   CMD ARG,X       ; Comment', () => {
        checkAST('LABEL   CMD ARG,X       ; Comment',
            aLine('LABEL', 'CMD', anArg('ARG', AddressMode.AddressX))
        );
    });
    it('        CMD ARG,  ARG2  ; Comment', () => {
        checkAST('        CMD ARG,  ARG2  ; Comment',
            aLine(undefined, 'CMD', anArg('ARG'), anArg('ARG2'))
        );
    });
    it('LABEL   CMD ARG,X,ARG2  ; Comment', () => {
        checkAST('LABEL   CMD ARG,X,ARG2  ; Comment',
            aLine('LABEL', 'CMD', anArg('ARG', AddressMode.AddressX), anArg('ARG2'))
        );
    });
    it('    INCLUDE "FILE.ASM"', () => {
        checkAST('    INCLUDE "FILE.ASM"',
            aLine(undefined, 'INCLUDE', {
                type: NodeType.Argument,
                addressMode: AddressMode.None,
                value: {
                    type: NodeType.StringLiteral,
                    text: 'FILE.ASM'
                }
            })
        );
    });
    // Check address parsing
    it('  LDX #$44', () => {
        checkAST('  LDX #$44',
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.Immediate,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    it('  LDX ($44,X)', () => {
        checkAST('  LDX ($44,X)',
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.IndirectX,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    it('  LDX ($44),Y', () => {
        checkAST('  LDX ($44),Y',
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.IndirectY,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    it('  LDX ($44)', () => {
        checkAST('  LDX ($44)',
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.Indirect,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    it('  LDX $44,X', () => {
        checkAST('  LDX $44,X',
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.AddressX,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    it('  LDX $44,Y', () => {
        checkAST('  LDX $44,Y', 
            aLine(undefined, 'LDX', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.AddressY,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }
            )
        );
    });
    // Check number parsing
    const NUMBER_LINE: TestLineNode = aLine(undefined, 'TEST', 
                {
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.Number,
                        value: 42
                    }
                }
        );
    it('   TEST %101010', () => {
        checkAST('   TEST %101010', NUMBER_LINE);
    });
    it('   TEST 052', () => {
        checkAST('   TEST 052', NUMBER_LINE);
    });
    it('   TEST 42', () => {
        checkAST('   TEST 42', NUMBER_LINE);
    });
    it('   TEST $2A', () => {
        checkAST('   TEST $2A', NUMBER_LINE);
    });
    it("    dc 'a", () => {
        checkAST("    dc 'a", 
            aLine(undefined, 'dc', {
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.CharLiteral,
                        value: 'a'
                    }
                }
            )
        );
    });
    it('  dc.s "unicode"', () => {
        checkAST('  dc.s "unicode"', 
            aLine(undefined, 'dc.s', {
                type: NodeType.Argument,
                addressMode: AddressMode.None,
                value: {
                    type: NodeType.StringLiteral,
                    text: 'unicode'
                }
            })
        );
    });
    it('  ECHO "Synonim for . ", *', () => {
        checkAST('  ECHO "Synonim for . ", *', 
            aLine(undefined, 'ECHO', 
                {
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.StringLiteral,
                        text: 'Synonim for . '
                    }
                }, 
                anArg('*')
            )
        );
    });
    it('Macros call with two arguments', () => {
        checkAST('  SOME FIRST, SECOND', aLine(undefined, 'SOME', anArg('FIRST'), anArg('SECOND')));
    });
});

function aLine(labelName?:string, commandName?: string, ...args: TestArgumentNode[]): TestLineNode {
    let labelNode: TestLabelNode | null = null;
    if (labelName)
        labelNode = {
            type: NodeType.Label,
            name: {
                type: NodeType.Identifier,
                name: labelName
            }
        };
    let commandNode: TestCommandNode | null = null;
    if (commandName)
        commandNode = {
            type: NodeType.Command,
            name: {
                type: NodeType.Identifier,
                name: commandName
            },
            args: args
        };
    return {
        type: NodeType.Line,
        label: labelNode,
        command: commandNode
    };
}

function anArg(name: string, addressMode?: AddressMode): TestArgumentNode {
    return {
        type: NodeType.Argument,
        addressMode: addressMode || AddressMode.None,
        value: {
            type: NodeType.Identifier,
            name: name
        }
    };
}
