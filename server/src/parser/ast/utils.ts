import { CstNode, ILexingError, IRecognitionException, IToken } from "chevrotain";
import { Location, Position, Range } from "vscode-languageserver";
import { getMessage, MSG } from "../../messages";
import { DiagnosticWithURI } from "../../validators/util";
import { DASM_LEXER } from "../cst/lexer";
import { DASM_PARSER } from "../cst/parser";
import { FileNode, LineNode } from "./nodes";
import { Visitor } from "./visitor";

export function parseText(uri: string, text: string): ParsingResult {
    if (text === '') return getEmptyResult(uri);        
    const lexerResult = DASM_LEXER.tokenize(text);
    const errors = lexerResult.errors.map(it => convertLexingError(it, uri));
    DASM_PARSER.input = lexerResult.tokens;
    const cst = DASM_PARSER.text();
    errors.push(...DASM_PARSER.errors.map(it => convertParserError(it, uri)));
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

function getEmptyResult(uri: string): ParsingResult {
    const location = Location.create(uri, Range.create(0,0,0,0));
    const ast = new FileNode(
        location, 
        [new LineNode(location, null, null)]
    );
    return {
        errors: [],
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
    return {
        uri,
        range: createRange(error.token),
        message: error.message,
        source: getMessage(MSG.PARSING_ERROR_SOURCE)
    };
}

export type RangeSource = CstNode | IToken | ILexingError;

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
    } else if ('location' in src) {
        const location = src.location!;
        line = location.endLine!;
        character = location.endColumn!;
    }
    return Position.create(line - 1, character);
}
