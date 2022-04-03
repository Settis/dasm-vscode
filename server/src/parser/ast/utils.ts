import { ILexingError, IRecognitionException } from "chevrotain";
import { Location, Range } from "vscode-languageserver";
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
        range: Range.create(
            error.line!,
            error.column!,
            error.line!,
            error.column! + error.length
        ),
        message: error.message,
        source: getMessage(MSG.LEXING_ERROR_SOURCE)
    };
}

function convertParserError(error: IRecognitionException, uri: string): DiagnosticWithURI {
    return {
        uri,
        range: Range.create(
            error.token.startLine!,
            error.token.startColumn!,
            error.token.endLine!,
            error.token.endColumn!
        ),
        message: error.message,
        source: getMessage(MSG.PARSING_ERROR_SOURCE)
    };
}
