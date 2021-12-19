import { Location } from 'vscode-languageserver';
import { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument';
import parseAsmLine, { Context, AsmLine } from "./asmLine";
import { isNumber, parseNumber } from './number';
import { OpMode, parseOpMode } from './opMode';

export type Node = LabelNode | CommandNode | CommandNameNode | CommentNode | ProgramNode | ArgumentsNode | OperationModeArgNode | LiteralNode | NumberNode;

interface BasicNode {
    type: NodeType
    parent?: Node
    location: Location
    children: Node[]
}

export interface LabelNode extends BasicNode {
    type: NodeType.Label
    name: string
    relatedObject?: RelatedObject
}

export interface CommandNode extends BasicNode {
    type: NodeType.Command
}

export interface CommandNameNode extends BasicNode {
    type: NodeType.CommandName
    name: string
}

export interface CommentNode extends BasicNode {
    type: NodeType.Comment
    comment: string
}

export interface ProgramNode extends BasicNode {
    type: NodeType.Program
    labels: RelatedContext
    localLabels: RelatedContext[]
}

export type RelatedContext = { [key: string]: RelatedObject }

export type RelatedObject = {
    definitions: LabelNode[],
    usages: LiteralNode[]
}

export interface ArgumentsNode extends BasicNode {
    type: NodeType.Arguments
}

export interface OperationModeArgNode extends BasicNode {
    type: NodeType.OprationModeArg
    mode: OpMode
}

export interface LiteralNode extends BasicNode {
    type: NodeType.Literal
    text: string
    relatedObject?: RelatedObject
}

export interface NumberNode extends BasicNode {
    type: NodeType.Number
    text: string
    value: number
}

export enum NodeType {
    Label = 'Label',
    Command = 'Command',
    CommandName = 'CommandName',
    Arguments = 'Arguments',
    OprationModeArg = 'OprationModeArg',
    Literal = 'Literal',
    Comment = 'Comment',
    Program = 'Program',
    Number = 'Number',
}

type DocumentLine = {
    uri: DocumentUri,
    lineNumber: number,
    asmLine: AsmLine
}

export function parseProgram(document: TextDocument): ProgramNode {
    const nodes = paseDocument(document);
    const program: ProgramNode = {
        type: NodeType.Program,
        children: [],
        labels: {},
        localLabels: [],
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
    nodes.forEach(it => joinNodes(program, it));
    return program;
}

export function paseDocument(document: TextDocument): Node[] {
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
            joinNodes(argsNode, constructOperationModeArg(documentLine, arg));
        return argsNode;
    }
}

function constructOperationModeArg(documentLine: DocumentLine, arg: Context): OperationModeArgNode {
    const parsedOpMode = parseOpMode(arg);
    const opModeNode: OperationModeArgNode = {
        type: NodeType.OprationModeArg,
        mode: parsedOpMode.mode,
        location: constructLocation(documentLine, arg),
        children: []
    };
    const opModeArg = parsedOpMode.arg;
    if (opModeArg) {
        joinNodes(opModeNode, contructExpressionNode(documentLine, opModeArg));
    }
    return opModeNode;
}

function contructExpressionNode(documentLine: DocumentLine, expression: Context): Node {
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