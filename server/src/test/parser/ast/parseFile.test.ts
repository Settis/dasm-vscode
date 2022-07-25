import * as assert from "assert";
import { AddressMode, BinaryOperatorType, IfDirectiveType, NodeType, UnaryOperatorType } from "../../../parser/ast/nodes";
import { parseText } from "../../../parser/ast/utils";
import { filterByMask } from "./objectCopy";

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
        checkAST('LABEL                            ', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'LABEL'
                }
            },
            command: null
        });
    });
    it('.LABEL                            ', () => {
        checkAST('.LABEL                            ', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: '.LABEL'
                }
            },
            command: null
        });
    });
    it('                        ; Comment', () => {
        checkAST('                        ; Comment');
    });
    it('LABEL                   ; Comment', () => {
        checkAST('LABEL                   ; Comment', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'LABEL'
                }
            },
            command: null
        });
    });
    it('        CMD ARG,X ARG2           ', () => {
        checkAST('        CMD ARG,X ARG2           ', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.AddressX,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG'
                        }
                    },
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG2'
                        }
                    }
                ]
            }
        });
    });
    it('LABEL   CMD             ; Comment', () => {
        checkAST('LABEL   CMD             ; Comment', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'LABEL'
                }
            },
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: []
            }
        });
    });
    it('LABEL   CMD ARG,X       ; Comment', () => {
        checkAST('LABEL   CMD ARG,X       ; Comment', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'LABEL'
                }
            },
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.AddressX,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG'
                        }
                    }
                ]
            }
        });
    });
    it('        CMD ARG   ARG2  ; Comment', () => {
        checkAST('        CMD ARG   ARG2  ; Comment', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG'
                        }
                    },
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG2'
                        }
                    }
                ]
            }
        });
    });
    it('LABEL   CMD ARG,X ARG2  ; Comment', () => {
        checkAST('LABEL   CMD ARG,X ARG2  ; Comment', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'LABEL'
                }
            },
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.AddressX,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG'
                        }
                    },
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.Identifier,
                            name: 'ARG2'
                        }
                    }
                ]
            }
        });
    });
    it('    INCLUDE "FILE.ASM"', () => {
        checkAST('    INCLUDE "FILE.ASM"', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'INCLUDE'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.StringLiteral,
                            text: 'FILE.ASM'
                        }
                    }
                ]
            }
        });
    });
    // Check address parsing
    it('  LDX #$44', () => {
        checkAST('  LDX #$44', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.Immediate,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    it('  LDX ($44,X)', () => {
        checkAST('  LDX ($44,X)', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.IndirectX,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    it('  LDX ($44),Y', () => {
        checkAST('  LDX ($44),Y', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.IndirectY,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    it('  LDX ($44)', () => {
        checkAST('  LDX ($44)', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.Indirect,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    it('  LDX $44,X', () => {
        checkAST('  LDX $44,X', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.AddressX,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    it('  LDX $44,Y', () => {
        checkAST('  LDX $44,Y', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'LDX'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.AddressY,
                    value: {
                        type: NodeType.Number,
                        value: 0x44
                    }
                }]
            }
        });
    });
    // Check number parsing
    const NUMBER_LINE: TestLineNode = {
        type: NodeType.Line,
        label: null,
        command: {
            type: NodeType.Command,
            name: {
                type: NodeType.Identifier,
                name: 'TEST'
            },
            args: [
                {
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.Number,
                        value: 42
                    }
                }
            ]
        }
    };
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
        checkAST("    dc 'a", {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'dc'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.CharLiteral,
                        value: 'a'
                    }
                }] 
            }
        });
    });
    it('  dc.s "unicode"', () => {
        checkAST('  dc.s "unicode"', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'dc'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.StringLiteral,
                        text: 'unicode'
                    }
                }] 
            }
        });
    });
    it('  ECHO "Synonim for . ", *', () => {
        checkAST('  ECHO "Synonim for . ", *', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'ECHO'
                },
                args: [
                    {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.StringLiteral,
                            text: 'Synonim for . '
                        }
                    }, {
                        type: NodeType.Argument,
                        addressMode: AddressMode.None,
                        value: {
                            type: NodeType.Identifier,
                            name: '*'
                        }
                    }
                ]
            }
        });
    });
});

describe('Correct AST for expressions', () => {
    const EXP: TestIdentifierNode = {
        type: NodeType.Identifier,
        name: 'exp'
    };
    it('  ECHO ~exp', () => {
        checkEchoExp('  ECHO ~exp', {
            type: NodeType.UnaryOperator,
            operatorType: UnaryOperatorType.OneComplement,
            operand: EXP
        });
    });
    it('  ECHO exp^-1', () => {
        checkEchoExp('  ECHO exp^-1', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.ArithmeticExclusiveOr,
            left: EXP,
            right: {
                type: NodeType.UnaryOperator,
                operatorType: UnaryOperatorType.Negation,
                operand: {
                    type: NodeType.Number,
                    value: 1
                }
            }
        });
    });
    it('  ECHO -exp', () => {
        checkEchoExp('  ECHO -exp', {
            type: NodeType.UnaryOperator,
            operatorType: UnaryOperatorType.Negation,
            operand: EXP
        });
    });
    it('  ECHO [exp^-1]+1', () => {
        checkEchoExp('  ECHO [exp^-1]+1', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.Addition,
            left: {
                type: NodeType.Brackets,
                value: {
                    type: NodeType.BinaryOperator,
                    operatorType: BinaryOperatorType.ArithmeticExclusiveOr,
                    left: EXP,
                    right: {
                        type: NodeType.UnaryOperator,
                        operatorType: UnaryOperatorType.Negation,
                        operand: {
                            type: NodeType.Number,
                            value: 1
                        }
                    }
                }
            },
            right: {
                type: NodeType.Number,
                value: 1
            }
        });
    });
    it('  ECHO !exp', () => {
        checkEchoExp('  ECHO !exp', {
            type: NodeType.UnaryOperator,
            operatorType: UnaryOperatorType.Not,
            operand: EXP
        });
    });
    it('  ECHO exp==0', () => {
        checkEchoExp('  ECHO exp==0', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.Equal,
            left: EXP,
            right: {
                type: NodeType.Number,
                value: 0
            }
        });
    });
    it('  ECHO <exp', () => {
        checkEchoExp('  ECHO <exp', {
            type: NodeType.UnaryOperator,
            operatorType: UnaryOperatorType.TakeLSB,
            operand: EXP
        });
    });
    it('  ECHO exp&$FF', () => {
        checkEchoExp('  ECHO exp&$FF', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.ArithmeticAnd,
            left: EXP,
            right: {
                type: NodeType.Number,
                value: 255
            }
        });
    });
    it('  ECHO >exp', () => {
        checkEchoExp('  ECHO >exp', {
            type: NodeType.UnaryOperator,
            operatorType: UnaryOperatorType.TakeMSB,
            operand: EXP
        });
    });
    it('  ECHO [exp>>8]&$FF', () => {
        checkEchoExp('  ECHO [exp>>8]&$FF', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.ArithmeticAnd,
            left: {
                type: NodeType.Brackets,
                value: {
                    type: NodeType.BinaryOperator,
                    operatorType: BinaryOperatorType.ArithmeticShiftRight,
                    left: EXP,
                    right: {
                        type: NodeType.Number,
                        value: 8
                    }
                }
            },
            right: {
                type: NodeType.Number,
                value: 255
            }
        });
    });
    it('  ECHO [ exp >> 8 ] & $FF', () => {
        checkEchoExp('  ECHO [exp>>8]&$FF', {
            type: NodeType.BinaryOperator,
            operatorType: BinaryOperatorType.ArithmeticAnd,
            left: {
                type: NodeType.Brackets,
                value: {
                    type: NodeType.BinaryOperator,
                    operatorType: BinaryOperatorType.ArithmeticShiftRight,
                    left: EXP,
                    right: {
                        type: NodeType.Number,
                        value: 8
                    }
                }
            },
            right: {
                type: NodeType.Number,
                value: 255
            }
        });
    });
});

function checkEchoExp(text: string, exp: TestExpressionNode) {
    checkAST(text, {
        type: NodeType.Line,
        label: null,
        command: {
            type: NodeType.Command,
            name: {
                type: NodeType.Identifier,
                name: 'ECHO'
            },
            args: [{
                type: NodeType.Argument,
                addressMode: AddressMode.None,
                value: exp
            }]
        }
    });
}

describe('Correct AST for multiline directives', () => {
    it('simple if', () => {
        checkAST(
`   IF ARG
      ADC $1
    ENDIF`,
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.IfDirective,
                    ifType: IfDirectiveType.If,
                    condition: {
                        type: NodeType.Identifier,
                        name: 'ARG'
                    },
                    thenBody: [{
                        type: NodeType.Line,
                        label: null,
                        command: {
                            type: NodeType.Command,
                            name: {
                                type: NodeType.Identifier,
                                name: 'ADC'
                            },
                            args: [{
                                type: NodeType.Argument,
                                addressMode: AddressMode.None,
                                value: {
                                    type: NodeType.Number,
                                    value: 1
                                }
                            }]
                        }
                    }],
                    elseBody: []
                }
            }
        );
    });
    it('if else', () => {
        checkAST(
`   IF ARG
      ADC $1
    ELSE
      CLI
    ENDIF`,
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.IfDirective,
                    ifType: IfDirectiveType.If,
                    condition: {
                        type: NodeType.Identifier,
                        name: 'ARG'
                    },
                    thenBody: [{
                        type: NodeType.Line,
                        label: null,
                        command: {
                            type: NodeType.Command,
                            name: {
                                type: NodeType.Identifier,
                                name: 'ADC'
                            },
                            args: [{
                                type: NodeType.Argument,
                                addressMode: AddressMode.None,
                                value: {
                                    type: NodeType.Number,
                                    value: 1
                                }
                            }]
                        }
                    }],
                    elseBody: [{
                        type: NodeType.Line,
                        label: null,
                        command: {
                            type: NodeType.Command,
                            name: {
                                type: NodeType.Identifier,
                                name: 'CLI'
                            },
                            args: []
                        }
                    }]
                }
            }
        );
    });
    it('repeat', () => {
        checkAST(
`   REPEAT ARG
      ADC $1
    REPEND`,
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.RepeatDirective,
                    expression: {
                        type: NodeType.Identifier,
                        name: 'ARG'
                    },
                    body: [{
                        type: NodeType.Line,
                        label: null,
                        command: {
                            type: NodeType.Command,
                            name: {
                                type: NodeType.Identifier,
                                name: 'ADC'
                            },
                            args: [{
                                type: NodeType.Argument,
                                addressMode: AddressMode.None,
                                value: {
                                    type: NodeType.Number,
                                    value: 1
                                }
                            }]
                        }
                    }]
                }
            }
        );
    });
    it('macro', () => {
        checkAST(
`   MACRO ARG
      ADC $1
    ENDM`,
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.MacroDirective,
                    name: {
                        type: NodeType.Identifier,
                        name: 'ARG'
                    },
                    body: '\n      ADC $1\n    '
                }
            }
        );
    });
});

function checkAST(text: string, ...lines: TestLineNode[]) {
    const actualResult = parseText('', text);
    assert.ok(actualResult.errors.length == 0, "Unexpected errors");
    const ast = actualResult.ast;
    const expectedAst: TestFileNode = {
        type: NodeType.File,
        lines: lines
    };
    assert.deepStrictEqual(filterByMask(ast, expectedAst), expectedAst);
}

type TestFileNode = {
    type: NodeType.File,
    lines: TestLineNode[]
}

type TestLineNode = {
    type: NodeType.Line,
    label: TestLabelNode | null,
    command: TestCommandNode | TestIfDirecitveNode | TestRepeatDirecitveNode | TestMacroDirectiveNode | null
}

type TestLabelNode = {
    type: NodeType.Label,
    name: TestIdentifierNode,
}

type TestIfDirecitveNode = {
    type: NodeType.IfDirective,
    ifType: IfDirectiveType,
    condition: TestExpressionNode,
    thenBody: TestLineNode[],
    elseBody: TestLineNode[]
}

type TestRepeatDirecitveNode = {
    type: NodeType.RepeatDirective,
    expression: TestExpressionNode,
    body: TestLineNode[]
}

type TestMacroDirectiveNode = {
    type: NodeType.MacroDirective,
    name: TestIdentifierNode,
    body: string
}

type TestCommandNode = {
    type: NodeType.Command,
    name: TestIdentifierNode,
    args: TestArgumentNode[]
}

type TestStringLiteralNode = {
    type: NodeType.StringLiteral,
    text: string
}

type TestArgumentNode = {
    type: NodeType.Argument,
    addressMode: AddressMode,
    value: TestExpressionNode
}

type TestExpressionNode = TestStringLiteralNode | TestIdentifierNode | TestNumberNode |
    TestUnaryOperatorNode | TestBinaryOperatorNode | TestBracketsNode | TestCharLiteralNode;

type TestUnaryOperatorNode = {
    type: NodeType.UnaryOperator,
    operatorType: UnaryOperatorType,
    operand: TestExpressionNode
}

type TestBinaryOperatorNode = {
    type: NodeType.BinaryOperator,
    operatorType: BinaryOperatorType,
    left: TestExpressionNode,
    right: TestExpressionNode
}

type TestBracketsNode = {
    type: NodeType.Brackets,
    value: TestExpressionNode
}

type TestNumberNode = {
    type: NodeType.Number,
    value: number
}

type TestIdentifierNode = {
    type: NodeType.Identifier,
    name: string
}

type TestCharLiteralNode = {
    type: NodeType.CharLiteral,
    value: string
}
