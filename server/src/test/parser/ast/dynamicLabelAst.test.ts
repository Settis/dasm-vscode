import { NodeType, AddressMode } from "../../../parser/ast/nodes";
import { checkAST } from "./utils";

describe('Dynamic labels AST', () => {
    it('Label definition', () => {
        checkAST('SOME_PREFIX_,COUNTER CMD', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.DynamicLabel,
                    identifiers: [
                        {
                            type: NodeType.Identifier,
                            name: 'SOME_PREFIX_'
                        },
                        {
                            type: NodeType.Identifier,
                            name: 'COUNTER'
                        }
                    ]
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
    it('Label usage', () => {
        checkAST('TMP set fna_,I', {
            type: NodeType.Line,
            label: {
                type: NodeType.Label,
                name: {
                    type: NodeType.Identifier,
                    name: 'TMP'
                }
            },
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'set'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
                        type: NodeType.DynamicLabel,
                        identifiers: [
                            {
                                type: NodeType.Identifier,
                                name: 'fna_'
                            },
                            {
                                type: NodeType.Identifier,
                                name: 'I'
                            }
                        ]
                    }
                }]
            }
        });
    });
});
