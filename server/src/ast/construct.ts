import { Location } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import parseAsmLine, { Context } from "../dasm/asmLine";
import { isNumber, parseNumber } from "../number";
import { FileNode, NodeType, Node, LabelNode, CommentNode, CommandNode, ArgumentsNode, DocumentLine, AddressXNode, AddressYNode, ImmediateNode, IndirectNode, IndirectXNode, IndirectYNode } from "./nodes";

export function parseFile(document: TextDocument): FileNode {
    const nodes = parseDocument(document);
    const fileRoot: FileNode = {
        type: NodeType.File,
        children: [],
        location: {
            uri: document.uri,
            range: {
                start: nodes[0]?.location?.range?.start || {
                    character: 0,
                    line: 0
                },
                end: nodes[nodes.length-1]?.location?.range?.end || {
                    character: 0,
                    line: 0
                }
            }
        }
    };
    nodes.forEach(it => joinNodes(fileRoot, it));
    return fileRoot;
}

export function parseDocument(document: TextDocument): Node[] {
    return document.getText()
        .split('\n')
        .map((lineText, lineNumber) => {
            return {
                uri: document.uri,
                lineNumber: lineNumber,
                asmLine: parseAsmLine(lineText)
            };
        })
        .flatMap((line) => constructNodes(line));
}

function constructNodes(documentLine: DocumentLine): Node[] {
    const result: Node[] = [];
    const commandNode = constructCommandNode(documentLine);
    if (commandNode) {
        result.push(commandNode);
    } else {
        const labelNode = constructLabelNode(documentLine);
        if (labelNode)
            result.push(labelNode);
    }
    const commentNode = constructCommentNode(documentLine);
    if (commentNode)
        result.push(commentNode);
    return result;
}

function constructLabelNode(documentLine: DocumentLine): LabelNode | undefined {
    const labelContext = documentLine.asmLine.label;
    if (labelContext) {
        return {
            type: NodeType.Label,
            location: constructLocation(documentLine, labelContext),
            name: labelContext.text,
            children: [],
        };
    }
}

function constructCommentNode(documentLine: DocumentLine): CommentNode | undefined {
    const commentContext = documentLine.asmLine.comment;
    if (commentContext) {
        return {
            type: NodeType.Comment,
            location: constructLocation(documentLine, commentContext),
            comment: commentContext.text,
            children: []
        };
    }
}

function constructCommandNode(documentLine: DocumentLine): CommandNode | undefined {
    const commandContext = documentLine.asmLine.command;
    if (commandContext) {
        const labelNode = constructLabelNode(documentLine);
        const args = documentLine.asmLine.arguments;
        const lastArgument = args[args.length - 1];
        const commandNode: CommandNode = {
            type: NodeType.Command,
            location: constructLocation(documentLine, documentLine.asmLine.label || commandContext, lastArgument || commandContext),
            children: []
        };
        if (labelNode) joinNodes(commandNode, labelNode);
        joinNodes(commandNode, {
            type: NodeType.CommandName,
            location: constructLocation(documentLine, commandContext),
            children: [],
            name: commandContext.text
        });
        const argumentsNode = constructArgumentsNode(documentLine);
        if (argumentsNode)
            joinNodes(commandNode, argumentsNode);
        return commandNode;
    }
}

function constructArgumentsNode(documentLine: DocumentLine): ArgumentsNode | undefined {
    const args = documentLine.asmLine.arguments;
    if (args.length > 0) {
        const lastArgument = args[args.length - 1];
        const argsNode: ArgumentsNode = {
            type: NodeType.Arguments,
            location: constructLocation(documentLine, args[0], lastArgument),
            children: []
        };
        for (const arg of args) 
            joinNodes(argsNode, constructArgumentNode(documentLine, arg));
        return argsNode;
    }
}

type AddressNodeType = NodeType.Immediate | NodeType.IndirectX | NodeType.IndirectY | NodeType.Indirect | NodeType.AddressX | NodeType.AddressY;

type AddressModeMatcher = {
    prefix: string
    suffix: string
    nodeType: AddressNodeType
}

function constructArgumentNode(documentLine: DocumentLine, arg: Context): Node {
    const matchers: AddressModeMatcher[] = [
        {prefix: '#', suffix: '', nodeType: NodeType.Immediate},
        {prefix: '(', suffix: ',X)', nodeType: NodeType.IndirectX},
        {prefix: '(', suffix: '),Y', nodeType: NodeType.IndirectY},
        {prefix: '(', suffix: ')', nodeType: NodeType.Indirect},
        {prefix: '', suffix: ',X', nodeType: NodeType.AddressX},
        {prefix: '', suffix: ',Y', nodeType: NodeType.AddressY},
    ];
    for (const matcher of matchers) {
        const candidate = constructAddressNode(documentLine, arg, matcher);
        if (candidate) return candidate;
    }
    return contructExpressionNode(documentLine, arg);
}

type AddressNode = ImmediateNode | IndirectXNode | IndirectYNode | IndirectNode | AddressXNode | AddressYNode;

function constructAddressNode(documentLine: DocumentLine, arg: Context, addressModeMatcher: AddressModeMatcher): AddressNode | undefined {
    if (arg.text.startsWith(addressModeMatcher.prefix) && arg.text.endsWith(addressModeMatcher.suffix)) {
        const node: AddressNode = {
            type: addressModeMatcher.nodeType,
            location: constructLocation(documentLine, arg),
            children: []
        };
        const expression: Context = {
            text: arg.text.substring(addressModeMatcher.prefix.length, arg.text.length - addressModeMatcher.suffix.length),
            range: {
                start: arg.range.start + addressModeMatcher.prefix.length,
                end: arg.range.end - addressModeMatcher.suffix.length
            }
        };
        joinNodes(node, contructExpressionNode(documentLine, expression));
        return node;
    }
}

function contructExpressionNode(documentLine: DocumentLine, expression: Context): Node {
    if (expression.text.startsWith('"') && expression.text.endsWith('"'))
        return {
            type: NodeType.StringLiteral,
            location: constructLocation(documentLine, expression),
            children: [],
            text: expression.text.substring(1, expression.text.length - 1)
        };
    if (isNumber(expression.text))
        return {
            type: NodeType.Number,
            location: constructLocation(documentLine, expression),
            text: expression.text,
            value: parseNumber(expression.text),
            children: []
        };
    return {
        type: NodeType.Literal,
        location: constructLocation(documentLine, expression),
        text: expression.text,
        children: []
    };
}

function constructLocation(documentLine: DocumentLine, contextFrom: Context, contextTo?: Context): Location {
    return {
        uri: documentLine.uri,
        range: {
            start: {
                line: documentLine.lineNumber,
                character: contextFrom.range.start
            },
            end: {
                line: documentLine.lineNumber,
                character: (contextTo || contextFrom).range.end
            }
        }
    };
}

function joinNodes(parent: Node, child: Node) {
    parent.children.push(child);
    child.parent = parent;
}
