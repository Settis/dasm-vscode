import { CstNode, ILexingError, IRecognitionException, IToken } from "chevrotain";
import { Location, Position, Range } from "vscode-languageserver";
import { getMessage, MSG } from "../../messages";
import { DiagnosticWithURI } from "../../validators/util";
import { DASM_LEXER } from "../cst/lexer";
import { DASM_PARSER } from "../cst/parser";
import { BasicNode, FileNode } from "./nodes";
import { Visitor } from "./visitor";

export function parseText(uri: string, text: string): ParsingResult {
    if (text === '') return getEmptyResult(uri);        
    const lexerResult = DASM_LEXER.tokenize(text);
    const errors = lexerResult.errors.map(it => convertLexingError(it, uri));
    DASM_PARSER.input = lexerResult.tokens;
    const cst = DASM_PARSER.text();
    errors.push(...DASM_PARSER.errors.map(it => convertParserError(it, uri)));
    if (errors.length !== 0) return getEmptyResult(uri, errors);
    const visitor = new Visitor(uri);
    return {
        errors,
        ast: visitor.constructAst(cst)
    };
}

export type ParsingResult = {
    errors: DiagnosticWithURI[],
    ast: FileNode
}

function getEmptyResult(uri: string, errors?: DiagnosticWithURI[]): ParsingResult {
    const location = Location.create(uri, Range.create(0,0,0,0));
    const ast = new FileNode(location, []);
    return {
        errors: errors || [],
        ast
    };
}

function convertLexingError(error: ILexingError, uri: string): DiagnosticWithURI {
    return {
        uri,
        range: createRange(error),
        message: error.message,
        source: getMessage(MSG.LEXING_ERROR_SOURCE)
    };
}

function convertParserError(error: IRecognitionException, uri: string): DiagnosticWithURI {
    let errorToken = error.token;
    if (isNaN(error.token.startOffset) && 'previousToken' in error) errorToken = (error as any).previousToken;
    return {
        uri,
        range: createRange(errorToken),
        message: error.message,
        source: getMessage(MSG.PARSING_ERROR_SOURCE)
    };
}

export type RangeSource = BasicNode | CstNode | IToken | ILexingError;

export function createRange(start: RangeSource, end?: RangeSource): Range {
    return Range.create(
        createStartPosition(start),
        createEndPosition(end || start)
    );
}

function createStartPosition(src: RangeSource): Position {
    let line = 0;
    let character = 0;
    if ('line' in src) {
        line = src.line!;
        character = src.column!;
    } else if ('startLine' in src) {
        line = src.startLine!;
        character = src.startColumn!;
    } else if ('type' in src) {
        return src.location.range.start;
    } else if ('location' in src) {
        const location = src.location!;
        line = location.startLine!;
        character = location.startColumn!;
    }
    return Position.create(line - 1, character - 1);
}

function createEndPosition(src: RangeSource): Position {
    let line = 0;
    let character = 0;
    if ('line' in src) {
        line = src.line!;
        character = src.column! + src.length - 1;
    } else if ('startLine' in src) {
        line = src.endLine!;
        character = src.endColumn!;
    } else if ('type' in src) {
        return src.location.range.end;
    } else if ('location' in src) {
        const location = src.location!;
        line = location.endLine!;
        character = location.endColumn!;
    }
    return Position.create(line - 1, character);
}

interface PositionWithUri extends Position {
    uri: string
}

export function getNodeByPosition(startingNode: BasicNode, position: PositionWithUri): BasicNode | undefined {
    if (!isPositionInsideNode(position, startingNode)) return;
    for (const child of startingNode.getChildren()) {
        const result = getNodeByPosition(child, position);
        if (result) return result;
    }
    return startingNode;
}

export function isPositionInsideNode(position: PositionWithUri, node: BasicNode): boolean {
    return position.uri === node.location.uri 
        && compare(node.location.range.start, position) < 1 
        && compare(position, node.location.range.end) < 1;
}

/**
 * 1: if (x > y)
 * 
 * 0: if (x==y)
 * 
 * -1: if (x < y)
 * @param x one position
 * @param y another position
 */
function compare(x: Position, y: Position): number {
    const lineComparison = compareNumbers(x.line, y.line);
    if (lineComparison === 0) return compareNumbers(x.character, y.character);
    return lineComparison;
}

function compareNumbers(x: number, y: number): number {
    if (x === y) return 0;
    if (x > y) return 1;
    return -1;
}
