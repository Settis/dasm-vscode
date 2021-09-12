import * as vscode from 'vscode';

export function getDocUri(file: string) {
    return vscode.Uri.file(file);
}

export async function openUseCaseFile(uri: vscode.Uri) {
    const extension = vscode.extensions.getExtension('Settis.dasm')!;
    await extension.activate();
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        console.error(error);
    }
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getErrors(uri: vscode.Uri) {
    return vscode.languages.getDiagnostics(uri);
}

export function getSeverityFor(name?: string) {
    switch (name) {
        case 'Hint':
            return vscode.DiagnosticSeverity.Hint;
        case 'Information':
            return vscode.DiagnosticSeverity.Information;
        case 'Warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'Error':
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}

export function constructRange(lineNumber: number, startChar: number, length: number) {
    return new vscode.Range(
        new vscode.Position(lineNumber, startChar),
        new vscode.Position(lineNumber, startChar + length)
    );
}
