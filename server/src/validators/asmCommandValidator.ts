import { MSG } from "../messages";
import { ModesSet, OperationDescription, operations } from "../dasm/operations";
import { OpMode } from "../dasm/opMode";
import { constructError, DiagnosticWithURI } from "./util";
import { NAMES } from "../dasm/directives";
import { isArguments, isCommandName, isNumber } from "../ast/astUtil";
import { CommandNode, CommandNameNode, Node, NodeType } from "../ast/nodes";

export function validateCommand(node: CommandNode): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    const commandName = node.children.find(isCommandName);
    if (commandName) {
        result.push(...validateCommandName(node, commandName));
    } else {
        result.push(constructError(MSG.NO_COMMAND_NAME, node));
    }
    return result;
}

function validateCommandName(node: CommandNode, commandName: CommandNameNode): DiagnosticWithURI[] {
    const operation = operations[commandName.name.toUpperCase()];
    const result: DiagnosticWithURI[] = [];
    if (operation) {
        const args = node.children.find(isArguments)?.children || [];
        result.push(...validateCommandArgs(commandName, operation, args));
    } else if (!NAMES.has(commandName.name.toUpperCase())) {
        result.push(constructError(MSG.UNKNOWN_COMMAND, commandName));
    }
    return result;
}

function validateCommandArgs(commandName: CommandNameNode, operation: OperationDescription, args: Node[]): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (args.length == 0 && ! (OpMode.Implied in operation.modes))
        result.push(constructError(MSG.NOT_IMPLIED_MODE, commandName));
    else if (args[0]?.type === NodeType.Immediate && ! (OpMode.Immediate in operation.modes))
        result.push(constructError(MSG.WRONG_IMMEDIATE, args[0]));
    else if (args[0])
        result.push(...validateCommandAddressMode(operation, args[0]));
    if (args.length > 1)
        result.push(constructError(MSG.TOO_MANY_ARGUMENTS, args[1], args[args.length-1]));
    return result;
}

const MODE_CONVERSOIN: {
    [key in OpMode]?: {
        zp: OpMode,
        absolute: OpMode
    }
} = {
    [OpMode.Address]: {
        zp: OpMode.ZeroPage,
        absolute: OpMode.Absolute
    },
    [OpMode.AddressX]: {
        zp: OpMode.ZeroPageX,
        absolute: OpMode.AbsoluteX
    },
    [OpMode.AddressY]: {
        zp: OpMode.ZeroPageY,
        absolute: OpMode.AbsoluteY
    }
};

const TYPE_TO_MODE: {
    [key in NodeType]?: OpMode
} = {
    [NodeType.Immediate]: OpMode.Immediate,
    [NodeType.Indirect]: OpMode.Indirect,
    [NodeType.IndirectX]: OpMode.IndirectX,
    [NodeType.IndirectY]: OpMode.IndirectY,
    [NodeType.AddressX]: OpMode.AddressX,
    [NodeType.AddressY]: OpMode.AddressY,
};

function validateCommandAddressMode(operation: OperationDescription, arg: Node): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    let mode = TYPE_TO_MODE[arg.type] || OpMode.Address;
    let numberNode = arg.children.find(isNumber);
    if (numberNode === undefined && arg.type === NodeType.Number)
        numberNode = arg; 
    if (numberNode) {
        if (isNaN(numberNode.value))
            result.push(constructError(MSG.INVALID_NUMBER, numberNode));
        else if (mode in MODE_CONVERSOIN) {
            if (numberNode.value > 0xFF)
                mode = MODE_CONVERSOIN[mode]!.absolute;
            else
                mode = MODE_CONVERSOIN[mode]!.zp;
        }
    }
    if (!checkModeIsPresent(mode, operation.modes))
        result.push(constructError(MSG.WRONG_ADDRESS_MODE, arg));
    return result;
}

function checkModeIsPresent(mode: OpMode, modeSet: ModesSet): boolean {
    if (mode == OpMode.Address)
        return OpMode.ZeroPage in modeSet || OpMode.Absolute in modeSet || OpMode.Displacement in modeSet;
    if (mode == OpMode.AddressX)
        return OpMode.ZeroPageX in modeSet || OpMode.AbsoluteX in modeSet;
    if (mode == OpMode.AddressY)
        return OpMode.ZeroPageY in modeSet || OpMode.AbsoluteY in modeSet;
    if (mode == OpMode.ZeroPage)
        return OpMode.ZeroPage in modeSet || OpMode.Displacement in modeSet;
    if (mode == OpMode.Absolute)
        return OpMode.Absolute in modeSet || OpMode.Displacement in modeSet;
    return mode in modeSet;
}
