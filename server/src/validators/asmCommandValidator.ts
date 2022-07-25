import { MSG } from "../messages";
import { ModesSet, OperationDescription, operations } from "../dasm/operations";
import { OpMode } from "../dasm/opMode";
import { constructError, DiagnosticWithURI } from "./util";
import { AddressMode, ArgumentNode, CommandNode, NodeType, NumberNode } from "../parser/ast/nodes";

export function validateGeneralCommand(node: CommandNode): DiagnosticWithURI[] {
    const commandName = unifyCommandName(node.name.name);
    const operation = operations[commandName];
    if (operation)
        return validateCommandArgs(node, operation);
    return [];
}

export type UnifiedCommandName = string;

export function unifyCommandName(rawName: string): UnifiedCommandName {
    let result = rawName.toUpperCase();
    if (result.startsWith('.'))
        result = result.substring(1);
    return result;
}

function validateCommandArgs(commandNode: CommandNode, operation: OperationDescription): DiagnosticWithURI[] {
    const args = commandNode.args;
    if (args.length == 0) {
        if (! (OpMode.Implied in operation.modes))
            return [constructError(MSG.NOT_IMPLIED_MODE, commandNode)];
        else
            return [];
    }
    const result: DiagnosticWithURI[] = [];
    if (args.length > 1)
        result.push(constructError(MSG.TOO_MANY_ARGUMENTS, args[1], args[args.length-1]));
    if (args[0].addressMode === AddressMode.Immediate && ! (OpMode.Immediate in operation.modes))
        result.push(constructError(MSG.WRONG_IMMEDIATE, args[0]));
    else if (args[0])
        result.push(...validateCommandAddressMode(operation, args[0]));
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
    [key in AddressMode]?: OpMode
} = {
    [AddressMode.Immediate]: OpMode.Immediate,
    [AddressMode.Indirect]: OpMode.Indirect,
    [AddressMode.IndirectX]: OpMode.IndirectX,
    [AddressMode.IndirectY]: OpMode.IndirectY,
    [AddressMode.AddressX]: OpMode.AddressX,
    [AddressMode.AddressY]: OpMode.AddressY,
};

function validateCommandAddressMode(operation: OperationDescription, arg: ArgumentNode): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    let mode = TYPE_TO_MODE[arg.addressMode] || OpMode.Address;
    if (arg.value.type === NodeType.Number) {
        if (mode in MODE_CONVERSOIN) {
            if ((arg.value as NumberNode ).value > 0xFF)
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
