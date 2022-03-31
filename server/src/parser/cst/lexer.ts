import { createToken, Lexer } from "chevrotain";

export const Space = createToken({ name: 'space', pattern: /[ \f\t\v]+/ });
export const Colon = createToken({ name: 'colon', pattern: /:/ });
export const Sharp = createToken({ name: 'sharp', pattern: /#/ });
export const OpenParenthesis = createToken({ name: 'openParenthesis', pattern: /\(/ });
export const CloseParenthesis = createToken({ name: 'closeParenthesis', pattern: /\)/ });
export const BinaryNumber = createToken({ name: 'binaryNumber', pattern: /%[01]+/ });
export const OctalNumber = createToken({ name: 'octalNumber', pattern: /0[0-7]+/ });
export const DecimalNumber = createToken({ name: 'decimalNumber', pattern: /\d+/ });
export const HexadecimalNumber = createToken({ name: 'hexadecimalNumber', pattern: /\$[\dA-Fa-f]+/ });
export const NewLineSeparator = createToken({ name: 'newLineSeprarator', pattern: /\n|\r\n?/});
export const AddressXEnding = createToken({ name: 'addressXEnding', pattern: /,[Xx]\b/ });
export const AddressYEnding = createToken({ name: 'addressYEnding', pattern: /,[Yy]\b/ });
export const IndirectXEnding = createToken({ name: 'indirectXEnding', pattern: /,[Xx]\)/ });
export const IndirectYEnding = createToken({ name: 'indirectYEnding', pattern: /\),[Yy]\b/ });
export const LocalLabel = createToken({ name: 'localLabel', pattern: /\.\w+/ });
export const Identifier = createToken({ name: 'identifier', pattern: /\w+/ });
export const Comment = createToken({ name: 'comment', pattern: /;[^\n\r]*/ });
export const StringLiteral = createToken({ name: 'stringLiteral', pattern: /"[^"]*"/ });

export const ALL_TOKENS = [
    Space,
    Colon,
    Sharp,
    IndirectXEnding,
    IndirectYEnding,
    AddressXEnding,
    AddressYEnding,
    OpenParenthesis,
    CloseParenthesis,
    BinaryNumber,
    OctalNumber,
    DecimalNumber,
    HexadecimalNumber,
    NewLineSeparator,
    LocalLabel,
    Identifier,
    Comment,
    StringLiteral
];

export const DASM_LEXER = new Lexer(ALL_TOKENS, {
    positionTracking: 'full'
});
