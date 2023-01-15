import { NodeType, IfDirectiveType, AddressMode } from "../../../parser/ast/nodes";
import { checkAST } from "./utils";

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
