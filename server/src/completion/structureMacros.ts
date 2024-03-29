type SnippetData = {[key: string]: SnippetItem};
type SnippetItem = {
    scope: string,
    prefix: string,
    body: string[],
    description?: string
}

export const DATA: SnippetData = {
	"IF EQUALS": {
		"scope": "dasm",
		"prefix": "IF_EQ",
		"body": [
			"IF_EQ",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF ZERO": {
		"scope": "dasm",
		"prefix": "IF_ZERO",
		"body": [
			"IF_ZERO",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF NOT EQUALS": {
		"scope": "dasm",
		"prefix": "IF_NEQ",
		"body": [
			"IF_NEQ",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF NOT ZERO": {
		"scope": "dasm",
		"prefix": "IF_NOT_ZERO",
		"body": [
			"IF_NOT_ZERO",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF PLUS": {
		"scope": "dasm",
		"prefix": "IF_PLUS",
		"body": [
			"IF_PLUS",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF MINUS": {
		"scope": "dasm",
		"prefix": "IF_MINUS",
		"body": [
			"IF_MINUS",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF NEGATIVE": {
		"scope": "dasm",
		"prefix": "IF_NEG",
		"body": [
			"IF_NEG",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF CARRY IS SET": {
		"scope": "dasm",
		"prefix": "IF_C_SET",
		"body": [
			"IF_C_SET",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF GREATER THAN OR EQUIVAL TO": {
		"scope": "dasm",
		"prefix": "IF_GE",
		"body": [
			"IF_GE",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF LESS THEN": {
		"scope": "dasm",
		"prefix": "IF_LT",
		"body": [
			"IF_LT",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF OVERFLOW SET": {
		"scope": "dasm",
		"prefix": "IF_V_SET",
		"body": [
			"IF_V_SET",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF OVERFLOW CLEAR": {
		"scope": "dasm",
		"prefix": "IF_V_CLR",
		"body": [
			"IF_V_CLR",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF FLAG (bit 7)": {
		"scope": "dasm",
		"prefix": "IF_FLAG_VAR",
		"body": [
			"IF_FLAG_VAR ${1:FLAG}, ${2|IS_SET,IS_CLEAR|}",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF BIT": {
		"scope": "dasm",
		"prefix": "IF_BIT",
		"description": "Accum gets changed if you specify a bit other than 6 or 7.",
		"body": [
			"IF_BIT ${1:MEM_ADR}, ${2:BIN_NR}, ${3|IS_HIGH,IS_LOW|}",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF MEMORY BYTE NEGATIVE": {
		"scope": "dasm",
		"prefix": "IF_MEM_BYTE_NEG",
		"body": [
			"IF_MEM_BYTE_NEG ${1:ADR}",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"IF MEMORY BYTE POSITIVE": {
		"scope": "dasm",
		"prefix": "IF_MEM_BYTE_POS",
		"body": [
			"IF_MEM_BYTE_POS ${1:ADR}",
			"\t$0",
			"ELSE_",
			"\t",
			"END_IF"
		]
	},
	"BEGIN ... AGAIN": {
		"scope": "dasm",
		"prefix": "AGAIN",
		"body": [
			"BEGIN",
			"\t$0",
			"AGAIN"
		]
	},
	"BEGIN ... WHILE_EQ ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_EQ",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_EQ",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_NEQ ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_NEQ",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_NEQ",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_ZERO ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_ZERO",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_ZERO",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_NOT_ZERO ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_NOT_ZERO",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_NOT_ZERO",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_PLUS ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_PLUS",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_PLUS",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_MINUS ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_MINUS",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_MINUS",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_NEG ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_NEG",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_NEG",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_C_CLR ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_C_CLR",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_C_CLR",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_C_SET ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_C_SET",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_C_SET",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_GE ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_GE",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_GE",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_LT ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_LT",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_LT",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_V_CLR ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_V_CLR",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_V_CLR",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_V_SET ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_V_SET",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_V_SET",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... WHILE_BIT ... REPEAT_": {
		"scope": "dasm",
		"prefix": "WHILE_BIT",
		"body": [
			"BEGIN",
			"\t$0",
			"WHILE_BIT ${1:MEM_ADR}, ${2:BIN_NR}, ${3|IS_HIGH,IS_LOW|}",
			"\t",
			"REPEAT_"
		]
	},
	"BEGIN ... UNTIL_EQ": {
		"scope": "dasm",
		"prefix": "UNTIL_EQ",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_EQ"
		]
	},
	"BEGIN ... UNTIL_ZERO": {
		"scope": "dasm",
		"prefix": "UNTIL_ZERO",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_ZERO"
		]
	},
	"BEGIN ... UNTIL_NEQ": {
		"scope": "dasm",
		"prefix": "UNTIL_NEQ",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_NEQ"
		]
	},
	"BEGIN ... UNTIL_NOT_ZERO": {
		"scope": "dasm",
		"prefix": "UNTIL_NOT_ZERO",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_NOT_ZERO"
		]
	},
	"BEGIN ... UNTIL_PLUS": {
		"scope": "dasm",
		"prefix": "UNTIL_PLUS",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_PLUS"
		]
	},
	"BEGIN ... UNTIL_MINUS": {
		"scope": "dasm",
		"prefix": "UNTIL_MINUS",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_MINUS"
		]
	},
	"BEGIN ... UNTIL_NEG": {
		"scope": "dasm",
		"prefix": "UNTIL_NEG",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_NEG"
		]
	},
	"BEGIN ... UNTIL_C_CLR": {
		"scope": "dasm",
		"prefix": "UNTIL_C_CLR",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_C_CLR"
		]
	},
	"BEGIN ... UNTIL_C_SET": {
		"scope": "dasm",
		"prefix": "UNTIL_C_SET",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_C_SET"
		]
	},
	"BEGIN ... UNTIL_GE": {
		"scope": "dasm",
		"prefix": "UNTIL_GE",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_GE"
		]
	},
	"BEGIN ... UNTIL_LT": {
		"scope": "dasm",
		"prefix": "UNTIL_LT",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_LT"
		]
	},
	"BEGIN ... UNTIL_V_CLR": {
		"scope": "dasm",
		"prefix": "UNTIL_V_CLR",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_V_CLR"
		]
	},
	"BEGIN ... UNTIL_V_SET": {
		"scope": "dasm",
		"prefix": "UNTIL_V_SET",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_V_SET"
		]
	},
	"BEGIN ... UNTIL_BIT": {
		"scope": "dasm",
		"prefix": "UNTIL_BIT",
		"body": [
			"BEGIN",
			"\t$0",
			"UNTIL_BIT ${1:MEM_ADR}, ${2:BIN_NR}, ${3|IS_HIGH,IS_LOW|}"
		]
	},
	"CASE ... END_CASE": {
		"scope": "dasm",
		"prefix": "CASE",
		"body": [
			"CASE ${1|ACCUM,X_REG,Y_REG|}",
			"\tCASE_OF ${2:value}",
			"\t\t$0",
			"\tEND_OF",
			"END_CASE"
		]
	},
	"CASE_OF ... END_OF": {
		"scope": "dasm",
		"prefix": "CASE_OF",
		"body": [
			"CASE_OF ${1:value}",
			"\t$0",
			"END_OF"
		]
	},
	"FOR ... NEXT": {
		"scope": "dasm",
		"prefix": "FOR",
		"body": [
			"FOR ${1:VAR_NAME}, ${2:INDEX}, UP_TO, ${3:LIMIT}",
			"\t$0",
			"NEXT"
		]
	},
	"FOR_X ... NEXT_X": {
		"scope": "dasm",
		"prefix": "FOR_X",
		"body": [
			"FOR_X ${1|ACCUM,X_REG,Y_REG|}, ${2|UP_TO,DOWN_TO|}, ${3|NEG_NRs,POS_NRs|}",
			"\t$0",
			"NEXT_X"
		]
	},
	"FOR_Y ... NEXT_Y": {
		"scope": "dasm",
		"prefix": "FOR_Y",
		"body": [
			"FOR_Y ${1|ACCUM,X_REG,Y_REG|}, ${2|UP_TO,DOWN_TO|}, ${3|NEG_NRs,POS_NRs|}",
			"\t$0",
			"NEXT_Y"
		]
	},
	"RTS IF EQ": {
		"scope": "dasm",
		"prefix": "RTS_IF_EQ",
		"body": [
			"RTS_IF_EQ",
			"$0"
		]
	},
	"RTS IF NE": {
		"scope": "dasm",
		"prefix": "RTS_IF_NE",
		"body": [
			"RTS_IF_NE",
			"$0"
		]
	},
	"RTS IF PLUS": {
		"scope": "dasm",
		"prefix": "RTS_IF_PLUS",
		"body": [
			"RTS_IF_PLUS",
			"$0"
		]
	},
	"RTS IF MINUS": {
		"scope": "dasm",
		"prefix": "RTS_IF_MINUS",
		"body": [
			"RTS_IF_MINUS",
			"$0"
		]
	},
	"RTS IF FLAG VAR": {
		"scope": "dasm",
		"prefix": "RTS_IF_FLAG_VAR",
		"body": [
			"RTS_IF_FLAG_VAR ${1:FLAG}, ${2|IS_SET,IS_CLEAR|}",
			"$0"
		]
	},
	"RTS IF BIT": {
		"scope": "dasm",
		"prefix": "RTS_IF_BIT",
		"body": [
			"RTS_IF_BIT ${1:MEM_ADR}, ${2:BIN_NR}, ${3|IS_HIGH,IS_LOW|}",
			"$0"
		]
	},
	"RTS IF MEM LOC": {
		"scope": "dasm",
		"description": "Alters Y for IS_0 or IS_NON_0.",
		"prefix": "RTS_IF_MEM_LOC",
		"body": [
			"RTS_IF_MEM_LOC ${1:ADR}, ${2|IS_POS,IS_NEG,IS_0,IS_NON_0|}",
			"$0"
		]
	}
};
