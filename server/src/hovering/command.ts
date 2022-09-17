import { Hover } from "vscode-languageserver";
import { operations } from "../dasm/operations";
import { OpMode } from "../dasm/opMode";
import { AstNode, NodeType } from "../parser/ast/nodes";

export function getCommandHover(nodes: AstNode[]): Hover | undefined {
    if (nodes.length < 2) return;
    const element = nodes[0];
    const parent = nodes[1];
    if (element.type == NodeType.Identifier && parent.type == NodeType.Command) {
        return getAsmOperationHover(element.name);
    }
}

const MODE_DISPLAY_NAME: { [key in OpMode]?: string; } = {
    [OpMode.Implied]: "Implied",
    [OpMode.Immediate]: "Immediate",
    [OpMode.ZeroPage]: "Zero Page",
    [OpMode.ZeroPageX]: "Zero Page, X",
    [OpMode.ZeroPageY]: "Zero Page, Y",
    [OpMode.Absolute]: "Absolute",
    [OpMode.AbsoluteX]: "Absolute, X",
    [OpMode.AbsoluteY]: "Absolute, Y", 
    [OpMode.Indirect]: "Indirect",
    [OpMode.IndirectX]: "Indirect, X", 
    [OpMode.IndirectY]: "Indirect, Y",
    [OpMode.Displacement]: "Displacement"
};

const SYNTAX_DISPLAY_NAME: { [key in OpMode]?: string; } = {
    [OpMode.Implied]: "",
    [OpMode.Immediate]: "#$44",
    [OpMode.ZeroPage]: "$44",
    [OpMode.ZeroPageX]: "$44,X",
    [OpMode.ZeroPageY]: "$44,Y",
    [OpMode.Absolute]: "$4400",
    [OpMode.AbsoluteX]: "$4400,X",
    [OpMode.AbsoluteY]: "$4400,Y", 
    [OpMode.Indirect]: "($4400)",
    [OpMode.IndirectX]: "($44,X)", 
    [OpMode.IndirectY]: "($44),Y",
    [OpMode.Displacement]: ""
};

function getAsmOperationHover(name: string): Hover | undefined {
    const upcaseName = name.toUpperCase();
    const operator = operations[upcaseName];
    if (!operator) return;
    let description = `**${operator.title}**\n\n`;
    
    if (operator.affectsFlags.length > 0) 
        description += "**Affected flags:** " + operator.affectsFlags.join(", ") + "\n\n";

    description += "| MODE | SYNTAX | HEX | LEN | TIM |\n";
    description += "| --- | --- | --- | --- | --- |\n";
    for (const [key, value] of Object.entries(operator.modes)) {
        const keyMode = key as OpMode;
        description += `| ${MODE_DISPLAY_NAME[keyMode]} | ${upcaseName} ${SYNTAX_DISPLAY_NAME[keyMode]} | $${value.hex.toString(16)} | ${value.len} | ${value.tim}`;
        if (value.boundaryCrossed)
            description += "+";
        description += "\n";
    }
    description += "\n";

    if (operator.description) 
        description += `${operator.description}`;
    
    return {
        contents: {
            kind: "markdown",
            value: description
        }
    };
}
