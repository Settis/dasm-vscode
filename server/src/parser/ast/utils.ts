import { DASM_LEXER } from "../cst/lexer";
import { DASM_PARSER } from "../cst/parser";
import { FileNode } from "./nodes";
import { Visitor } from "./visitor";

export function parseText(uri: string, text: string): FileNode {
    const lexerResult = DASM_LEXER.tokenize(text);
    // TODO: collect lexer errors
    DASM_PARSER.input = lexerResult.tokens;
    // TODO: collect parser errors
    const visitor = new Visitor(uri);
    return visitor.constructAst(DASM_PARSER.text());
}
