import { CommandNameNode, CommandNode, NodeType, OperationModeArgNode } from "../ast";
import { MSG } from "../messages";
import { ModesSet, OperationDescription, operations } from "../operations";
import { OpMode } from "../opMode";
import { constructError, DiagnosticWithURI } from "./util";

export function validateCommand(node: CommandNode): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    const commandName = node.children.find(it => it.type === NodeType.CommandName);
    if (commandName) {
        result.push(...validateCommandName(node, commandName as CommandNameNode));
    } else {
        result.push(constructError(MSG.NO_COMMAND_NAME, node));
    }
    return result;
}

function validateCommandName(node: CommandNode, commandName: CommandNameNode): DiagnosticWithURI[] {
    const operation = operations[commandName.name];
    const result: DiagnosticWithURI[] = [];
    if (operation) {
        const args = node.children.find(it => it.type === NodeType.Arguments)?.children || [];
        result.push(...validateCommandArgs(commandName, operation, args as OperationModeArgNode[]));
    } else {
        result.push(constructError(MSG.UNKNOWN_COMMAND, commandName));
    }
    return result;
}

function validateCommandArgs(commandName: CommandNameNode, operation: OperationDescription, args: OperationModeArgNode[]): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (OpMode.Implied in operation.modes && args.length > 0)
        result.push(constructError(MSG.ONLY_IMPLIED_MODE, args[0], args[args.length-1]));
    else if (args.length == 0 && ! (OpMode.Implied in operation.modes))
        result.push(constructError(MSG.NOT_IMPLIED_MODE, commandName));
    else if (args[0]?.mode === OpMode.Immediate && ! (OpMode.Immediate in operation.modes))
        result.push(constructError(MSG.WRONG_IMMEDIATE, args[0]));
    else if (args[0] && ! (checkModeIsPresent(args[0].mode, operation.modes)))
        result.push(constructError(MSG.WRONG_ADDRESS_MODE, args[0]));
    if (args.length > 1)
        result.push(constructError(MSG.TOO_MANY_ARGUMENTS, args[1], args[args.length-1]));
    return result;
}

function checkModeIsPresent(mode: OpMode, modeSet: ModesSet): boolean {
    if (mode == OpMode.Address)
        return OpMode.ZeroPage in modeSet || OpMode.Absolute in modeSet || OpMode.Displacement in modeSet;
    if (mode == OpMode.AddressX)
        return OpMode.ZeroPageX in modeSet || OpMode.AbsoluteX in modeSet;
    if (mode == OpMode.AddressY)
        return OpMode.ZeroPageY in modeSet || OpMode.AbsoluteY in modeSet;
    return mode in modeSet;
}

function convertMode(mode: OpMode): OpMode {
    if (mode == OpMode.Address) return OpMode.Absolute;
    if (mode == OpMode.AddressX) return OpMode.AbsoluteX;
    if (mode == OpMode.AddressY) return OpMode.AbsoluteY;
    return mode;
}