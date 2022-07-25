import { UnifiedCommandName } from "../../validators/asmCommandValidator";
import { BasicNode } from "./nodes";

export type MacrosByName = Map<UnifiedCommandName, MacrosObject>

export type MacrosObject = {
    name: UnifiedCommandName,
    definitions: BasicNode[],
    usages: BasicNode[],
}
