import { createToken, CstParser, Lexer } from "chevrotain";

const OpenBrace = createToken({ name: 'open brace', pattern: /{/ });
const CloseBrace = createToken({ name: 'close brace', pattern: /}/ });
const Pipe = createToken({ name: 'pipe', pattern: /\|/ });
const Other = createToken({ name: 'other', pattern: /.+/, line_breaks: true });
const Word = createToken({ name: 'word', pattern: /\w+/, longer_alt: Other });
const Comma = createToken({ name: 'comma', pattern: /,/ });

const ALL_TOKENS = [
    OpenBrace,
    CloseBrace,
    Pipe,
    Word,
    Other
];

const useCaseLexer = new Lexer(ALL_TOKENS);

class UseCaseParser extends CstParser {
    constructor() {
        super(ALL_TOKENS);
        this.performSelfAnalysis();
        
    }

    public text = this.RULE('text', () => {
        this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.textWithTag);
        });
    });

    private textWithTag = this.RULE('textWithTag', () => {
        this.CONSUME(Other);
        this.OPTION(() => {
            this.SUBRULE(this.tag);
        });
    });

    private tag = this.RULE('tag', () => {
        this.CONSUME(OpenBrace);
        this.OPTION(() => {
            this.SUBRULE(this.text);
        });
        this.CONSUME(Pipe);
        this.AT_LEAST_ONE_SEP({
            SEP: Comma,
            DEF: () => {
                this.CONSUME(Word);
            }
        });
        this.CONSUME(CloseBrace);
    });
}

const useCaseParser = new UseCaseParser();

export function parse(text: string) {
    const lexingResult = useCaseLexer.tokenize(text);
    useCaseParser.input = lexingResult.tokens;
    const cst = useCaseParser.text();
    console.log(cst);
    if (useCaseParser.errors.length > 0) {
        throw new Error("sad sad panda, Parsing errors detected " + useCaseParser.errors);
    }
}