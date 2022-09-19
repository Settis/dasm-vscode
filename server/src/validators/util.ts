import { Diagnostic, DiagnosticSeverity, DocumentUri } from "vscode-languageserver";
import { getMessage, MSG } from "../messages";
import { AstNode } from "../parser/ast/nodes";

export interface DiagnosticWithURI extends Diagnostic {
    uri: DocumentUri
}

export function constructError(msg: MSG, fromNode: AstNode, toNode?: AstNode): DiagnosticWithURI {
    return constructDiagnostic(msg, DiagnosticSeverity.Error, fromNode, toNode);
}

export function constructWarning(msg: MSG, fromNode: AstNode, toNode?: AstNode): DiagnosticWithURI {
    return constructDiagnostic(msg, DiagnosticSeverity.Warning, fromNode, toNode);
}

function constructDiagnostic(msg:MSG, severity: DiagnosticSeverity, fromNode: AstNode, toNode?: AstNode): DiagnosticWithURI {
    return {
        uri: fromNode.location.uri,
        range: {
            start: fromNode.location.range.start,
            end: (toNode || fromNode).location.range.end
        },
        message: getMessage(msg),
        severity: severity
    };
}