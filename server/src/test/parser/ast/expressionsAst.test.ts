import { NodeType, UnaryOperatorType, BinaryOperatorType, AddressMode } from "../../../parser/ast/nodes";
import { TestIdentifierNode, TestExpressionNode, checkAST } from "./utils";

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
