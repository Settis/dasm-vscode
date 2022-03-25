import { CstParser } from "chevrotain";
import * as lexer from "./lexer";

class DasmParser extends CstParser {
    constructor() {
        super(lexer.ALL_TOKENS);
        this.performSelfAnalysis();
    }

    public text = this.RULE('text', () => {
        this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.statement);
        });
    });

    private statement = this.RULE('statement', () => {
        this.CONSUME(lexer.Identifier);
    });
}

export const DASM_PARSER = new DasmParser();
