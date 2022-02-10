import * as assert from 'assert';
import { Location } from 'vscode-languageserver';
import { Position, Range, TextDocument } from 'vscode-languageserver-textdocument';
import { parseFile } from '../ast/construct';
import { NodeType, Node, LabelNode, CommandNameNode, CommentNode, LiteralNode, StringLiteralNode, FileNode } from '../ast/nodes';

describe('AST tests', () => {
    it('zero line', () => {
        const program = parseFile(new TestTextDocument(''));
        assert.strictEqual(program.children.length, 0);
    });
    it('long line', () => {
        const program = parseFile(new TestTextDocument('                                 '));
        assert.strictEqual(program.type, NodeType.File);
        assert.strictEqual(program.children.length, 0);
    });
    it('Two empty lines', () => {
        const program = parseFile(new TestTextDocument('   \n    '));
        assert.strictEqual(program.children.length, 0);
    });
    it('LABEL                            ', () => {
        const program = parseFile(new TestTextDocument('LABEL                            '));
        assert.strictEqual(program.children.length, 1);
        checkLabel(program.children[0]);
    });
    it('                        ; Comment', () => {
        const program = parseFile(new TestTextDocument('                        ; Comment'));
        assert.strictEqual(program.children.length, 1);
        checkCommentNode(program.children[0]);
    });
    it('LABEL                   ; Comment', () => {
        const program = parseFile(new TestTextDocument('LABEL                   ; Comment'));
        assert.strictEqual(program.children.length, 2);
        checkLabel(program.children[0]);
        checkCommentNode(program.children[1]);
    });
    it('        CMD ARG,X ARG2           ', () => {
        const program = parseFile(new TestTextDocument('        CMD ARG,X ARG2           '));
        assert.strictEqual(program.children.length, 1);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 8, 22);
        assert.strictEqual(commandNode.children.length, 2);
        checkCommandName(commandNode.children[0]);
        const args = commandNode.children[1];
        basicNodeCheck(args, NodeType.Arguments, 12, 22);
        assert.strictEqual(args.children.length, 2);
        checkArgXNode(args.children[0]);
        checkArg2Node(args.children[1]);
    });
    it('LABEL   CMD             ; Comment', () => {
        const program = parseFile(new TestTextDocument('LABEL   CMD             ; Comment'));
        assert.strictEqual(program.children.length, 2);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 0, 11);
        assert.strictEqual(commandNode.children.length, 2);
        checkLabel(commandNode.children[0]);
        checkCommandName(commandNode.children[1]);
        checkCommentNode(program.children[1]);
    });
    it('LABEL   CMD ARG,X       ; Comment', () => {
        const program = parseFile(new TestTextDocument('LABEL   CMD ARG,X       ; Comment'));
        assert.strictEqual(program.children.length, 2);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 0, 17);
        assert.strictEqual(commandNode.children.length, 3);
        checkLabel(commandNode.children[0]);
        checkCommandName(commandNode.children[1]);
        const args = commandNode.children[2];
        basicNodeCheck(args, NodeType.Arguments, 12, 17);
        assert.strictEqual(args.children.length, 1);
        checkArgXNode(args.children[0]);
        checkCommentNode(program.children[1]);
    });
    it('        CMD ARG   ARG2  ; Comment', () => {
        const program = parseFile(new TestTextDocument('        CMD ARG   ARG2  ; Comment'));
        assert.strictEqual(program.children.length, 2);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 8, 22);
        assert.strictEqual(commandNode.children.length, 2);
        checkCommandName(commandNode.children[0]);
        const args = commandNode.children[1];
        basicNodeCheck(args, NodeType.Arguments, 12, 22);
        assert.strictEqual(args.children.length, 2);
        checkArgNode(args.children[0]);
        checkArg2Node(args.children[1]);
        checkCommentNode(program.children[1]);
    });
    it('LABEL   CMD ARG,X ARG2  ; Comment', () => {
        const program = parseFile(new TestTextDocument('LABEL   CMD ARG,X ARG2  ; Comment'));
        assert.strictEqual(program.children.length, 2);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 0, 22);
        assert.strictEqual(commandNode.children.length, 3);
        checkLabel(commandNode.children[0]);
        checkCommandName(commandNode.children[1]);
        const args = commandNode.children[2];
        basicNodeCheck(args, NodeType.Arguments, 12, 22);
        assert.strictEqual(args.children.length, 2);
        checkArgXNode(args.children[0]);
        checkArg2Node(args.children[1]);
        checkCommentNode(program.children[1]);
    });
    it('    INCLUDE "FILE.ASM"', () => {
        const program = parseFile(new TestTextDocument('    INCLUDE "FILE.ASM"'));
        assert.strictEqual(program.children.length, 1);
        const commandNode = program.children[0];
        basicNodeCheck(commandNode, NodeType.Command, 4, 22);
        assert.strictEqual(commandNode.children.length, 2);
        const commandNameNode = commandNode.children[0] as CommandNameNode;
        basicNodeCheck(commandNameNode, NodeType.CommandName, 4, 11);
        assert.strictEqual(commandNameNode.name, "INCLUDE");
        const args = commandNode.children[1];
        assert.strictEqual(args.children.length, 1);
        const fileName = args.children[0] as StringLiteralNode;
        basicNodeCheck(fileName, NodeType.StringLiteral, 12, 22);
        assert.strictEqual(fileName.text, "FILE.ASM");
    });
    // Check address parsing
    it('  LDX #$44', () => {
        const program = parseFile(new TestTextDocument('  LDX #$44'));
        basicNodeCheck(getArgument(program), NodeType.Immediate, 6, 10);
    });
    it('  LDX ($44,X)', () => {
        const program = parseFile(new TestTextDocument('  LDX ($44,X)'));
        basicNodeCheck(getArgument(program), NodeType.IndirectX, 6, 13);
    });
    it('  LDX ($44),Y', () => {
        const program = parseFile(new TestTextDocument('  LDX ($44),Y'));
        basicNodeCheck(getArgument(program), NodeType.IndirectY, 6, 13);
    });
    it('  LDX ($44)', () => {
        const program = parseFile(new TestTextDocument('  LDX ($44)'));
        basicNodeCheck(getArgument(program), NodeType.Indirect, 6, 11);
    });
    it('  LDX $44,X', () => {
        const program = parseFile(new TestTextDocument('  LDX $44,X'));
        basicNodeCheck(getArgument(program), NodeType.AddressX, 6, 11);
    });
    it('  LDX $44,Y', () => {
        const program = parseFile(new TestTextDocument('  LDX $44,Y'));
        basicNodeCheck(getArgument(program), NodeType.AddressY, 6, 11);
    });
});

function checkLabel(node: Node) {
    basicNodeCheck(node, NodeType.Label, 0, 5);
    assert.strictEqual((node as LabelNode).name, 'LABEL');
}

function checkCommandName(node: Node) {
    basicNodeCheck(node, NodeType.CommandName, 8, 11);
    assert.strictEqual((node as CommandNameNode).name, 'CMD');
}

function checkCommentNode(node: Node) {
    basicNodeCheck(node, NodeType.Comment, 26, 33);
    assert.strictEqual((node as CommentNode).comment, 'Comment');
}

function checkArgNode(node:Node) {
    basicNodeCheck(node, NodeType.Literal, 12, 15);
    assert.strictEqual((node as LiteralNode).text, 'ARG');
}

function checkArgXNode(node: Node) {
    basicNodeCheck(node, NodeType.AddressX, 12, 17);
    const literal = node.children[0];
    basicNodeCheck(literal, NodeType.Literal, 12, 15);
    assert.strictEqual((literal as LiteralNode).text, 'ARG');
}

function checkArg2Node(node: Node) {
    basicNodeCheck(node, NodeType.Literal, 18, 22);
    assert.strictEqual((node as LiteralNode).text, 'ARG2');
}

function basicNodeCheck(node: Node, type: NodeType, from: number, to: number) {
    assert.strictEqual(node.type, type);
    assert.deepStrictEqual(node.location, constructLocation(from, to));
}

function getArgument(program: FileNode): Node {
    const commandNode = program.children[0];
    const args = commandNode.children[1];
    return args.children[0];
}

const URI = "test://document.asm";

function constructLocation(from: number, to: number): Location {
    return {
        uri: URI,
        range: {
            start: {
                line: 0,
                character: from
            },
            end: {
                line: 0,
                character: to
            }
        }
    };
}

class TestTextDocument implements TextDocument {
    uri = URI;
    languageId = 'dasm';
    version = 1;
    lineCount;

    constructor(readonly text: string) {
        this.lineCount = text.split('\n').length;
    }

    getText(range?: Range): string {
        if (range)
            throw new Error('Method not implemented.');
        return this.text;
    }

    positionAt(offset: number): Position {
        throw new Error('Method not implemented.');
    }
    offsetAt(position: Position): number {
        throw new Error('Method not implemented.');
    }    
}
