import { Location, Range } from "vscode-languageserver";
import { DASM_LEXER } from "../cst/lexer";
import { DASM_PARSER } from "../cst/parser";
import { FileNode, LineNode } from "./nodes";
import { Visitor } from "./visitor";

export function parseText(uri: string, text: string): FileNode {
    if (text === '') return getEmptyFile(uri);        
    const lexerResult = DASM_LEXER.tokenize(text);
    // TODO: process lexer errors
    const lexerErrors = lexerResult.errors;
    DASM_PARSER.input = lexerResult.tokens;
    const cst = DASM_PARSER.text();
    // TODO: process parser errors
    const parserErrors = DASM_PARSER.errors;
    const visitor = new Visitor(uri);
    return visitor.constructAst(cst);
}

function getEmptyFile(uri: string): FileNode {
    const location = Location.create(uri, Range.create(0,0,0,0));
    return new FileNode(
        location, 
        [new LineNode(location, null, null)]
    );
}
