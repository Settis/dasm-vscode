import { OpMode } from "./opMode";

const BranchDescription = 'Branches are dependant on the status of the flag bits when the op code is encountered. A branch not taken requires two machine cycles. Add one if the branch is taken and add one more if the branch crosses a page boundary.';
const CompareDescription = 'Compare sets flags as if a subtraction had been carried out. If the value in the accumulator is equal or greater than the compared value, the Carry will be set. The equal (Z) and negative (N) flags will be set based on equality or lack thereof and the sign (i.e. A>=$80) of the accumulator.';

export const operations: OperationsSet = {
    ADC: {
        title: 'ADd with Carry',
        description: 'ADC results are dependant on the setting of the decimal flag. In decimal mode, addition is carried out on the assumption that the values involved are packed BCD (Binary Coded Decimal). There is no way to add without carry.',
        affectsFlags: ['N', 'V', 'Z', 'C'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0x69,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x65,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x75,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x6D,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x7D,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0x79,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0x61,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0x71,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    AND: {
        title: 'bitwise AND with accumulator',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0x29,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x25,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x35,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x2D,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x3D,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0x39,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0x21,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0x31,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    ASL: {
        title: 'Arithmetic Shift Left',
        description: 'ASL shifts all bits left one position. 0 is shifted into bit 0 and the original bit 7 is shifted into the Carry.',
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Accumulator]: {
                hex: 0x0A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x06,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x16,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x0E,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x1E,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    BIT: {
        title: 'test BITs',
        description: 'BIT sets the Z flag as though the value in the address tested were ANDed with the accumulator. The N and V flags are set to match bits 7 and 6 respectively in the value stored at the tested address.',
        affectsFlags: ['N', 'V', 'Z'],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0x24,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x2C,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            }
        }
    },
    BPL: {
        title: 'Branch on PLus',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0x10,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BMI: {
        title: 'Branch on MInus',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0x30,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BVC: {
        title: 'Branch on oVerflow Clear',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0x50,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BVS: {
        title: 'Branch on oVerflow Set',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0x70,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BCC: {
        title: 'Branch on Carry Clear',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0x90,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BCS: {
        title: 'Branch on Carry Set',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0xB0,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BNE: {
        title: 'Branch on Not Equal',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0xD0,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BEQ: {
        title: 'Branch on EQual',
        description: BranchDescription,
        affectsFlags: [],
        modes: {
            [OpMode.Displacement]: {
                hex: 0xF0,
                len: 2,
                tim: 2,
                boundaryCrossed: true
            }
        }
    },
    BRK: {
        title: 'BReaK',
        description: 'BRK causes a non-maskable interrupt and increments the program counter by one.',
        affectsFlags: ['B'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x00,
                len: 1,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    CMP: {
        title: 'CoMPare accumulator',
        description: CompareDescription,
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xC9,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xC5,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xD5,
                len: 2, 
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xCD,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0xDD,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0xD9,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0xC1,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0xD1,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    CPX: {
        title: 'ComPare X register',
        description: CompareDescription,
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xE0,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xE4,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xEC,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            }
        }        
    },
    CPY: {
        title: 'ComPare Y register',
        description: CompareDescription,
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xC0,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xC4,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xCC,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            }
        }        
    },
    DEC: {
        title: 'DECrement memory',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0xC6,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xD6,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xCE,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0xDE,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    EOR: {
        title: 'bitwise Exclusive OR',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0x49,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x45,
                len: 2, 
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x55,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x4D,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x5D,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0x59,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0x41,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0x51,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    CLC: {
        title: 'CLear Carry',
        affectsFlags: ['C'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x18,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    SEC: {
        title: 'SEt Carry',
        affectsFlags: ['C'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x38,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    CLI: {
        title: 'CLear Interrupt',
        affectsFlags: ['I'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x58,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    SEI: {
        title: 'SEt Interrupt',
        affectsFlags: ['I'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x78,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    CLV: {
        title: 'CLear oVerflow',
        affectsFlags: ['V'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xB8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    CLD: {
        title: 'CLear Decimal',
        affectsFlags: ['D'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xD8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    SED: {
        title: 'SEt Decimal',
        affectsFlags: ['D'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xF8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    INC: {
        title: 'INCrement memory',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0xE6,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xF6,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xEE,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            }, 
            [OpMode.AbsoluteX]: {
                hex: 0xFE,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    JMP: {
        title: 'JuMP',
        description: 'JMP transfers program execution to the following address (absolute) or to the location contained in the following address (indirect). Note that there is no carry associated with the indirect jump so: AN INDIRECT JUMP MUST NEVER USE A VECTOR BEGINNING ON THE LAST BYTE OF A PAGE',
        affectsFlags: [],
        modes: {
            [OpMode.Absolute]: {
                hex: 0x4C,
                len: 3,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.Indirect]: {
                hex: 0x6C,
                len: 3,
                tim: 5,
                boundaryCrossed: false
            }
        }
    },
    JSR: {
        title: 'Jump to SubRoutine',
        description: 'JSR pushes the address-1 of the next operation on to the stack before transferring program control to the following address. Subroutines are normally terminated by a RTS op code.',
        affectsFlags: [],
        modes: {
            [OpMode.Absolute]: {
                hex: 0x20,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            }
        }
    },
    LDA: {
        title: 'LoaD Accumulator',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xA9,
                len: 2, 
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xA5,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xB5,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xAD,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0xBD,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0xB9,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0xA1,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0xB1,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    LDX: {
        title: 'LoaD X register',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xA2,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xA6,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageY]: {
                hex: 0xB6,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xAE,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteY]: {
                hex: 0xBE,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            }
        }
    },
    LDY: {
        title: 'LoaD Y register',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xA0,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xA4,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xB4,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xAC,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0xBC,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            }
        }
    },
    LSR: {
        title: 'Logical Shift Right',
        description: 'LSR shifts all bits right one position. 0 is shifted into bit 7 and the original bit 0 is shifted into the Carry.',
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Accumulator]: {
                hex: 0x4A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x46,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x56,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x4E,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x5E,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    NOP: {
        title: 'No OPeration',
        description: 'NOP is used to reserve space for future modifications or effectively REM out existing code.',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0xEA,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    ORA: {
        title: 'bitwise OR with Accumulator',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0x09,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x05,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x15,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x0D,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x1D,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0x19,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0x01,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0x11,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    TAX: {
        title: 'Transfer A to X',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xAA,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    TXA: {
        title: 'Transfer X to A',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x8A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    DEX: {
        title: 'DEcrement X',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xCA,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    INX: {
        title: 'INcrement X',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xE8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    TAY: {
        title: 'Transfer A to Y',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xA8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    TYA: {
        title: 'Transfer Y to A',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x98,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    DEY: {
        title: 'DEcrement Y',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x88,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    INY: {
        title: 'INcrement Y',
        affectsFlags: ['N', 'Z'],
        modes: {
            [OpMode.Implied]: {
                hex: 0xC8,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    ROL: {
        title: 'ROtate Left',
        description: 'ROL shifts all bits left one position. The Carry is shifted into bit 0 and the original bit 7 is shifted into the Carry.',
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Accumulator]: {
                hex: 0x2A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x26,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x36,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x2E,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x3E,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    ROR: {
        title: 'ROtate Right',
        description: 'ROR shifts all bits right one position. The Carry is shifted into bit 7 and the original bit 0 is shifted into the Carry.',
        affectsFlags: ['N', 'Z', 'C'],
        modes: {
            [OpMode.Accumulator]: {
                hex: 0x6A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0x66,
                len: 2,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x76,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x6E,
                len: 3,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x7E,
                len: 3,
                tim: 7,
                boundaryCrossed: false
            }
        }
    },
    RTI: {
        title: 'ReTurn from Interrupt',
        description: 'RTI retrieves the Processor Status Word (flags) and the Program Counter from the stack in that order (interrupts push the PC first and then the PSW). Note that unlike RTS, the return address on the stack is the actual address rather than the address-1.',
        affectsFlags: ['N', 'Z', 'C', 'D', 'V', 'I'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x40,
                len: 1,
                tim: 6,
                boundaryCrossed: false
            }
        }
    },
    RTS: {
        title: 'ReTurn from Subroutine',
        description: 'RTS pulls the top two bytes off the stack (low byte first) and transfers program control to that address+1. It is used, as expected, to exit a subroutine invoked via JSR which pushed the address-1.',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0x60,
                len: 1,
                tim: 6,
                boundaryCrossed: false
            }
        }
    },
    SBC: {
        title: 'SuBtract with Carry',
        description: 'SBC results are dependant on the setting of the decimal flag. In decimal mode, subtraction is carried out on the assumption that the values involved are packed BCD (Binary Coded Decimal). There is no way to subtract without the carry which works as an inverse borrow. i.e, to subtract you set the carry before the operation. If the carry is cleared by the operation, it indicates a borrow occurred.',
        affectsFlags: ['N', 'V', 'Z', 'C'],
        modes: {
            [OpMode.Immediate]: {
                hex: 0xE9,
                len: 2,
                tim: 2,
                boundaryCrossed: false
            },
            [OpMode.ZeroPage]: {
                hex: 0xE5,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0xF5,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0xED,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0xFD,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.AbsoluteY]: {
                hex: 0xF9,
                len: 3,
                tim: 4,
                boundaryCrossed: true
            },
            [OpMode.IndirectX]: {
                hex: 0xE1,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0xF1,
                len: 2,
                tim: 5,
                boundaryCrossed: true
            }
        }
    },
    STA: {
        title: 'STore Accumulator',
        affectsFlags: [],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0x85,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x95,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x8D,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteX]: {
                hex: 0x9D,
                len: 3,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.AbsoluteY]: {
                hex: 0x99,
                len: 3,
                tim: 5,
                boundaryCrossed: false
            },
            [OpMode.IndirectX]: {
                hex: 0x81,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            },
            [OpMode.IndirectY]: {
                hex: 0x91,
                len: 2,
                tim: 6,
                boundaryCrossed: false
            }
        }
    },
    TXS: {
        title: 'Transfer X to Stack ptr',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0x9A,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    TSX: {
        title: 'Transfer Stack ptr to X',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0xBA,
                len: 1,
                tim: 2,
                boundaryCrossed: false
            }
        }
    },
    PHA: {
        title: 'PusH Accumulator',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0x48,
                len: 1,
                tim: 3,
                boundaryCrossed: false
            }
        }
    },
    PLA: {
        title: 'PuLl Accumulator',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0x68,
                len: 1,
                tim: 4,
                boundaryCrossed: false
            }
        }
    },
    PHP: {
        title: 'PusH Processor status',
        affectsFlags: [],
        modes: {
            [OpMode.Implied]: {
                hex: 0x08,
                len: 1,
                tim: 3,
                boundaryCrossed: false
            }
        }
    },
    PLP: {
        title: 'PuLl Processor status',
        affectsFlags: ['N', 'Z', 'C', 'D', 'V', 'I'],
        modes: {
            [OpMode.Implied]: {
                hex: 0x28,
                len: 1,
                tim: 4,
                boundaryCrossed: false
            }
        }
    },
    STX: {
        title: 'STore X register',
        affectsFlags: [],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0x86,
                len: 2,
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageY]: {
                hex: 0x96,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x8E,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            }
        }
    },
    STY: {
        title: 'STore Y register',
        affectsFlags: [],
        modes: {
            [OpMode.ZeroPage]: {
                hex: 0x84,
                len: 2, 
                tim: 3,
                boundaryCrossed: false
            },
            [OpMode.ZeroPageX]: {
                hex: 0x94,
                len: 2,
                tim: 4,
                boundaryCrossed: false
            },
            [OpMode.Absolute]: {
                hex: 0x8C,
                len: 3,
                tim: 4,
                boundaryCrossed: false
            }
        }
    }
};

type OperationsSet = {
    [name: string]: OperationDescription
}

type OperationDescription = {
    title: string,
    description?: string,
    affectsFlags: string[],
    modes: ModesSet
}

type ModesSet = {
    [key in OpMode]?: ModeDescription;
}

type ModeDescription = {
    hex: number,
    len: number,
    tim: number,
    boundaryCrossed: boolean
}