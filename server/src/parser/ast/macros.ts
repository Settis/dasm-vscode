import { UnifiedCommandName } from "../../validators/asmCommandValidator";
import { AstNode } from "./nodes";

export type MacrosByName = Map<UnifiedCommandName, MacrosObject>

export type MacrosObject = {
    name: UnifiedCommandName,
    definitions: AstNode[],
    usages: AstNode[],
}
