import { Context } from "./asmLine";

export const enum OpMode {
    Implied, 
    Accumulator, 
    Immediate, 
    ZeroPage, 
    ZeroPageX, 
    ZeroPageY, 
    Absolute, 
    AbsoluteX, 
    AbsoluteY, 
    IndirectX, 
    IndirectY,
    Displacement, // for branch instructions
    // Address mode is used when it's not clear is it ZP or Absolute
    Address,  
    AddressX,
    AddressY,
}

type OpModeArg = {
    mode: OpMode,
    arg?: Context
}

