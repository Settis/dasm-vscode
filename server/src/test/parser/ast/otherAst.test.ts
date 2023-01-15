import { NodeType } from "../../../parser/ast/nodes";
import { checkAST } from "./utils";

describe('Other cases', () => {
    it('IF_EQ macro name', () => {
        checkAST('  IF_EQ', {
            type: NodeType.Line,
            label: null,
            command: {
                type: NodeType.Command,
                name: {
                    name: 'IF_EQ',
                    type: NodeType.Identifier
                },
                args: []
            }
        });
    });
});
