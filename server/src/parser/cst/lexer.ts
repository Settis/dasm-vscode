import { createToken, Lexer } from "chevrotain";

export const Comma = createToken({ name: 'comma', pattern: /,/ });
export const Space = createToken({ name: 'space', pattern: /\s+/ });
export const Colon = createToken({ name: 'colon', pattern: /:/ });
export const Sharp = createToken({ name: 'sharp', pattern: /#/ });
export const OpenParenthesis = createToken({ name: 'openParenthesis', pattern: /\(/ });
export const CloseParenthesis = createToken({ name: 'closeParenthesis', pattern: /\)/ });
export const BinaryNumber = createToken({ name: 'binaryNumber', pattern: /%[01]+/ });
export const OctalNumber = createToken({ name: 'octalNumber', pattern: /0[0-7]+/ });
export const DecimalNumber = createToken({ name: 'decimalNumber', pattern: /\d+/ });
export const HexadecimalNumber = createToken({ name: 'hexadecimalNumber', pattern: /\$[\dA-Fa-f]+/ });
export const LocalLabel = createToken({ name: 'localLabel', pattern: /\.\w+/ });
export const Identifier = createToken({ name: 'identifier', pattern: /\w+/ });
export const Comment = createToken({ name: 'comment', pattern: /;[^\n\r]*/ });
export const StringLiteral = createToken({ name: 'stringLiteral', pattern: /"[^"]*"/ });

export const ALL_TOKENS = [
    Comma,
    Space,
    Colon,
    Sharp,
    OpenParenthesis,
    CloseParenthesis,
    BinaryNumber,
    OctalNumber,
    DecimalNumber,
    HexadecimalNumber,
    LocalLabel,
    Identifier,
    Comment,
    StringLiteral
];

export const DASM_LEXER = new Lexer(ALL_TOKENS);
