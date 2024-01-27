    include "simpleInclude.asm"
    JMP theLink
    incdir "some"
    include "another.asm"
    JMP ANOTHER

    ; Test that macrosed included too
    MACRO INC_IN_MACRO
    INCLUDE {1}
    ENDM

    INC_IN_MACRO includeMacro.asm
    TEST
