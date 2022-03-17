import { createToken, CstParser, Lexer } from "chevrotain";

const OpenBrace = createToken({ name: 'openBrace', pattern: /{/ });
const CloseBrace = createToken({ name: 'closeBrace', pattern: /}/ });
const Pipe = createToken({ name: 'pipe', pattern: /\|/ });
const Other = createToken({ name: 'other', pattern: /[^{}|\r\n,]+/ });
const Word = createToken({ name: 'word', pattern: /\w+/, longer_alt: Other });
const Comma = createToken({ name: 'comma', pattern: /,/ });
const LineSeparator = createToken({ name: 'lineSeparator', pattern: /\r\n|\n|\r/});

const ALL_TOKENS = [
    OpenBrace,
    CloseBrace,
    Pipe,
    Comma,
    LineSeparator,
    Word,
    Other
];

const useCaseLexer = new Lexer(ALL_TOKENS);

export class UseCaseParser extends CstParser {
    constructor() {
        super(ALL_TOKENS);
        this.performSelfAnalysis();
    }

    public text = this.RULE('text', () => {
        this.AT_LEAST_ONE_SEP({
            SEP: LineSeparator,
            DEF: () => {
                this.SUBRULE(this.textLine);
            }
        });
    });

    private textLine = this.RULE('textLine', () => {
        this.MANY(() => {
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
            this.SUBRULE(this.textLine);
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
    if (useCaseParser.errors.length > 0) {
        throw new Error("sad sad panda, Parsing errors detected " + useCaseParser.errors);
    }
    return cst;
}
