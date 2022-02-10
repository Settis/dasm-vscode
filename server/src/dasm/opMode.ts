export const enum OpMode {
    Implied = 'Implied',
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
