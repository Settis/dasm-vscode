import { NodeType, IfDirectiveType, AddressMode } from "../../../parser/ast/nodes";
import { checkAST, TestLineNode } from "./utils";

describe('Correct AST for multiline directives', () => {
    it('simple if', () => {
        checkAST(
`   IF ARG
      ADC $1
    ENDIF`,
            createIfDirectiveAst(false));
    });
    it('if else', () => {
        checkAST(
`   IF ARG
      ADC $1
    ELSE
      CLI
    ENDIF`,
            createIfDirectiveAst(true));
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
    it('macro with Windows line endings', () => {
        checkAST(
            ' MAC FOO\r\n' +
            ' ENDM\r\n' +
            ' FOO',
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.MacroDirective,
                    name: {
                        type: NodeType.Identifier,
                        name: 'FOO'
                    },
                    body: ' '
                }
            },
            {
                type: NodeType.Line,
                label: null,
                command: {
                    type: NodeType.Command,
                    name: {
                        type: NodeType.Identifier,
                        name: 'FOO'
                    },
                    args: []
                }
            }
        );
    });
});

function createIfDirectiveAst(withElse: boolean): TestLineNode {
    let elseBody: TestLineNode[] = [];
    if (withElse) 
        elseBody = [{
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
        }];
    return {
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
            elseBody: elseBody
        }
    };
}
