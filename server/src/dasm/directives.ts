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
]);
