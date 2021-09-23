import { Context } from "./asmLine";

export const enum OpMode {
    Implied = 'Implied',
    Accumulator = 'Accumulator', 
    Immediate = 'Immediate', 
    ZeroPage = 'ZeroPage', 
    ZeroPageX = 'ZeroPageX', 
    ZeroPageY = 'ZeroPageY', 
    Absolute = 'Absolute', 
    AbsoluteX = 'AbsoluteX', 
    AbsoluteY = 'AbsoluteY', 
    Indirect = 'Indirect',
    IndirectX = 'IndirectX', 
    IndirectY = 'IndirectY',
    Displacement = 'Displacement', // for branch instructions
    // Address mode is used when it's not clear is it ZP or Absolute
    Address = 'Address',  
    AddressX = 'AddressX',
    AddressY = 'AddressY',
}

type OpModeArg = {
    readonly mode: OpMode,
    readonly arg?: Context
}

export function parseOpMode(context: Context): OpModeArg {
    if (context.text === '') return { mode: OpMode.Implied };
    if (context.text === 'A') return { mode: OpMode.Accumulator };
    if (context.text.startsWith('#'))
        return {
            mode: OpMode.Immediate,
            arg: {
                text: context.text.substr(1),
                range: {
                    start: context.range.start + 1,
                    end: context.range.end
                }
            }
        };
    if (context.text.startsWith('(') && context.text.endsWith(',X)'))
        return {
            mode: OpMode.IndirectX,
            arg: {
                text: context.text.substring(1, context.text.length - 3),
                range: {
                    start: context.range.start + 1,
                    end: context.range.end - 3
                }
            }
        };
    if (context.text.startsWith('(') && context.text.endsWith('),Y'))
        return {
            mode: OpMode.IndirectY,
            arg: {
                text: context.text.substring(1, context.text.length - 3),
                range: {
                    start: context.range.start + 1,
                    end: context.range.end - 3
                }
            }
        };
    if (context.text.startsWith('(') && context.text.endsWith(')'))
        return {
            mode: OpMode.Indirect,
            arg: {
                text: context.text.substring(1, context.text.length - 1),
                range: {
                    start: context.range.start + 1,
                    end: context.range.end - 1
                }
            }
        };
    if (context.text.endsWith(',X'))
        return {
            mode: OpMode.AddressX,
            arg: {
                text: context.text.substring(0, context.text.length - 2),
                range: {
                    start: context.range.start,
                    end: context.range.end - 2
                }
            }
        };
    if (context.text.endsWith(',Y'))
        return {
            mode: OpMode.AddressY,
            arg: {
                text: context.text.substring(0, context.text.length - 2),
                range: {
                    start: context.range.start,
                    end: context.range.end - 2
                }
            }
        };
    return {
        mode: OpMode.Address,
        arg: context
    };
}
