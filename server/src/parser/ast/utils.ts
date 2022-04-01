import { ILexingError, IRecognitionException } from "chevrotain";
import { Location, Range } from "vscode-languageserver";
import { DASM_LEXER } from "../cst/lexer";
import { DASM_PARSER } from "../cst/parser";
import { FileNode, LineNode } from "./nodes";
import { Visitor } from "./visitor";

export function parseText(uri: string, text: string): ParsingResult {
    if (text === '') return getEmptyResult(uri);        
    const lexerResult = DASM_LEXER.tokenize(text);
    const lexerErrors = lexerResult.errors;
    DASM_PARSER.input = lexerResult.tokens;
    const cst = DASM_PARSER.text();
    const parserErrors = DASM_PARSER.errors;
    const visitor = new Visitor(uri);
    return {
        lexerErrors,
        parserErrors,
        ast: visitor.constructAst(cst)
    };
}

export type ParsingResult = {
    lexerErrors: ILexingError[],
    parserErrors: IRecognitionException[],
    ast: FileNode
}

function getEmptyResult(uri: string): ParsingResult {
    const location = Location.create(uri, Range.create(0,0,0,0));
    const ast = new FileNode(
        location, 
        [new LineNode(location, null, null)]
    );
    return {
        lexerErrors: [],
        parserErrors: [],
        ast
    };
}
