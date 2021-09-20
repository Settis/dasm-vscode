import { Diagnostic, DiagnosticSeverity, DocumentUri } from "vscode-languageserver";
import { Node } from "../ast";
import { getMessage, MSG } from "../messages";

export interface DiagnosticWithURI extends Diagnostic {
    uri: DocumentUri
}

export function constructError(msg: MSG, fromNode: Node, toNode?: Node): DiagnosticWithURI {
    return {
        uri: fromNode.location.uri,
        range: {
            start: fromNode.location.range.start,
            end: (toNode || fromNode).location.range.end
        },
        message: getMessage(msg),
        severity: DiagnosticSeverity.Error
    };
}