import { DocumentSymbol, SymbolKind } from "vscode-languageserver";
import { Program } from "../program";
import { AstNode } from "../parser/ast/nodes";

export function getSymbols(program: Program): DocumentSymbol[] {
    const result = getLabelsSymbols(program);
    return result.concat(getMacrosSymbols(program));
}

function getLabelsSymbols(program: Program): DocumentSymbol[] {
    const uri = program.uri;
    const result: DocumentSymbol[] = [];
    for (const label of program.globalLabels.values()) {
        label.definitions.filter(it => it.location.uri === uri)
            .map(it => createDocumentSymbol(label.name, SymbolKind.Constant, it))
            .forEach(it => result.push(it));
    }
    return result;
}

function getMacrosSymbols(program: Program): DocumentSymbol[] {
    const uri = program.uri;
    const result: DocumentSymbol[] = [];
    for (const macro of program.macroses.values()) {
        macro.definitions.filter(it => it.location.uri === uri)
            .map(it => createDocumentSymbol(macro.name, SymbolKind.Operator, it))
            .forEach(it => result.push(it));
    }
    return result;
}

function createDocumentSymbol(name: string, kind: SymbolKind, node: AstNode) {
    return DocumentSymbol.create(
        name,
        undefined,
        kind,
        node.location.range,
        node.location.range
    );
}
