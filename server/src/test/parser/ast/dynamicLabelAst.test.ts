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
        checkAST('  CMD SOME_PREFIX_</>COUNTER', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    type: NodeType.Identifier,
                    name: 'CMD'
                },
                args: [{
                    type: NodeType.Argument,
                    addressMode: AddressMode.None,
                    value: {
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
                }]
            }
        });
    });
});
