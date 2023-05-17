export const SUBROUTINE = 'SUBROUTINE';
export const INCLUDE = 'INCLUDE';
export const INCDIR = 'INCDIR';
export const INCBIN = 'INCBIN';
export const PROCESSOR = 'PROCESSOR';
export const ORG = 'ORG';
export const EQU = 'EQU';
export const EQM = 'EQM';
export const SET = 'SET';
export const SETSTR = 'SETSTR';
export const ECHO = 'ECHO';
export const DC = 'DC';
export const BYTE = 'BYTE';
export const WORD = 'WORD';
export const LONG = 'LONG';
export const DS = 'DS';
export const DV = 'DV';
export const HEX = 'HEX';
export const SEG = 'SEG';
export const ALIGN = 'ALIGN';
export const ERR = 'ERR';
export const LIST = 'LIST';
export const RORG = 'RORG';
export const REND = 'REND';

// this is a part of grammar, but I need it for consistency
export const IFCONST = 'IFCONST';
export const IFNCONST = 'IFNCONST';
export const IF = 'IF';
export const ELSE = 'ELSE';
export const EIF = 'EIF';
export const ENDIF = 'ENDIF';
export const REPEAT = 'REPEAT';
export const REPEND = 'REPEND';
export const MAC = 'MAC';
export const MACRO = 'MACRO';
export const ENDM = 'ENDM';

export const NAMES = new Set([
    SUBROUTINE,
    INCLUDE,
    INCDIR,
    INCBIN,
    PROCESSOR,
    ORG,
    EQU,
    EQM,
    SET,
    SETSTR,
    ECHO,
    DC,
    BYTE,
    WORD,
    LONG,
    DS,
    DV,
    HEX,
    SEG,
    ALIGN,
    ERR,
    LIST,
    RORG,
    REND,

    IFCONST,
    IFNCONST,
    IF,
    ELSE,
    EIF,
    ENDIF,
    REPEAT,
    REPEND,
    MAC,
    MACRO,
    ENDM,
]);
