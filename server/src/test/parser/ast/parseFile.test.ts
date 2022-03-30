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
        checkAST('LABEL                            ', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                isLocal: false,
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
                isLocal: true,
                name: {
                    type: NodeType.Identifier,
                    name: '.LABEL'
                }
            },
            command: null
        });
    });
    it('                        ; Comment', () => {
        checkAST('                        ; Comment', {
            type: NodeType.Line,
            label: null,
            command: null
        });
    });
    it('LABEL                   ; Comment', () => {
        checkAST('LABEL                   ; Comment', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                isLocal: false,
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
                isLocal: false,
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
                isLocal: false,
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
                isLocal: false,
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
    name: TestIdentifierNode,
    isLocal: boolean
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
    value: TestStringLiteralNode | TestIdentifierNode | TestNumberNode
}

type TestNumberNode = {
    type: NodeType.Number,
    value: number
}

type TestIdentifierNode = {
    type: NodeType.Identifier,
    name: string
}
