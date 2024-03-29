import { CompletionAction, ErrorAction, fixturesFolder, GetDefinitionAction, GetUsagesAction, HoveringAction, readUseCases, RenameAction, UseCase, UseCaseAnnotation } from "./useCasesHelper";
import { constructRange, flushCodeCoverage, getDocUri, getErrors, getOpendFileName, openUseCaseFile } from './vscodeHelper';
import * as assert from 'assert';
import * as path from 'path';
import { Range, DiagnosticSeverity, commands, Location, Hover, MarkdownString, CompletionList, DocumentSymbol, Position, WorkspaceEdit } from "vscode";

const useCases = readUseCases();

export const mochaHooks = {
    async afterAll() {
      await flushCodeCoverage();
    }
};

suite('Description is valid for:', () => {
    for (const useCase of useCases) {
        test(useCase.name, () => {
            for (const annotation of useCase.getAnnotations()) {
                assert.ok(annotation.name in useCase.description.actions, `annotation ${annotation.name} not described`);
                const action = useCase.description.actions[annotation.name];
                switch (action.type) {
                    case 'Error':
                        assert.ok('message' in action, `Action ${annotation.name} has no message`);
                        assert.ok('severity' in action, `Action ${annotation.name} has no severity`);
                        assert.ok(action.severity && action.severity in DiagnosticSeverity, `Action ${annotation.name} has invalid severity`);
                        break;
                    case "GetDefinition":
                    case "GetUsages":
                        assert.ok('result' in action, `Action ${annotation.name} has no result`);
                        break;
                    case "DefinitionResult":
                    case "UsagesResult":
                    case 'CantRename':
                        // Nothing to check here
                        break;
                    case 'Hovering':
                    case 'Completion':
                    case 'TextEdit':
                        assert.ok('text' in action, `Action ${annotation.name} has no text`);
                        break;
                    case "Rename":
                        assert.ok('newName' in action, `Action ${annotation.name} has no new name`);
                        assert.ok('result' in action, `Action ${annotation.name} has no result`);
                        break;
                    default:
                        assert.fail(`Unknown action ${JSON.stringify(action)}`);
                }
            }
        });
    }
});

for (const useCase of useCases) {
    suite(`Case: ${useCase.name}`, () => {
        const mainUri = getDocUri(useCase.getMainFile());
        const annotations = useCase.getAnnotations();

        suiteSetup(async () => { 
            await openUseCaseFile(mainUri);
        });

        test("check errors", async () => {
            const expectedErrors = annotations.filter(it => it.action.type === "Error");
            const actualErrors = await getErrors(mainUri, expectedErrors.length);
            for (const expectedError of expectedErrors) {
                const expectedRange = getRange(expectedError);
                const actualError = actualErrors.find(it => it.range.isEqual(expectedRange));
                const errorAction = expectedError.action as ErrorAction;
                if (actualError) {
                    assert.strictEqual(actualError.message, errorAction.message, printLineWithRange(useCase, actualError.range));
                    const actualSeverity = DiagnosticSeverity[actualError.severity];
                    assert.strictEqual(actualSeverity, errorAction.severity, printLineWithRange(useCase, actualError.range));
                } else {
                    assert.fail(`This error is expected, but not found.\n ${printLineWithRange(useCase, expectedRange)}\n ${errorAction.severity} : ${errorAction.message}`);
                }
            }
            for (const actualError of actualErrors) {
                const expectedError = expectedErrors.find(it => getRange(it).isEqual(actualError.range));
                if (!expectedError)
                    assert.fail(`This error is not expected.\n ${printLineWithRange(useCase, actualError.range)}\n ${DiagnosticSeverity[actualError.severity]} : ${actualError.message}`);
            }
        });

        test("check definitions", async () => {
            for (const getDefinitionAnnotation of annotations.filter(it => it.action.type === 'GetDefinition')) {
                const actualDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
                    line: getDefinitionAnnotation.range.line,
                    character: getDefinitionAnnotation.range.startChar,
                });
                const getDefResult = (getDefinitionAnnotation.action as GetDefinitionAction).result;
                if (actualDefinitions === undefined && getDefResult === null) continue;
                const expectedResults = annotations.filter(it => it.name === getDefResult);

                checkDefRef(useCase, expectedResults, actualDefinitions, 'definition');
            }
        });

        test("check references", async () => {
            for (const getUsagesAnnotation of annotations.filter(it => it.action.type === 'GetUsages')) {
                const actualReferences = await commands.executeCommand<Location[]>('vscode.executeReferenceProvider', mainUri, {
                    line: getUsagesAnnotation.range.line,
                    character: getUsagesAnnotation.range.startChar,
                });
                const getRefResult = (getUsagesAnnotation.action as GetUsagesAction).result;
                if (actualReferences === undefined && getRefResult === null) continue;
                const expectedReferences = annotations.filter(it => it.name === getRefResult);

                checkDefRef(useCase, expectedReferences, actualReferences, 'reference');
            }
        });

        test("check hovering", async () => {
            for (const getHoveringAnnotation of annotations.filter(it => it.action.type === 'Hovering')) {
                const text = (getHoveringAnnotation.action as HoveringAction).text;
                const notMatch = (getHoveringAnnotation.action as HoveringAction).not ?? false;
                const hover = await commands.executeCommand<Hover[]>('vscode.executeHoverProvider', mainUri, {
                    line: getHoveringAnnotation.range.line,
                    character: getHoveringAnnotation.range.startChar,
                });
                if (hover.length == 0) {
                    if (notMatch) continue;
                    assert.fail(`Hovering is expected here, but there is no any.\n ${printLineWithRange(useCase, getRange(getHoveringAnnotation))}`);
                }
                const message = (hover[0].contents[0] as MarkdownString).value;
                const matched = message.includes(text);
                if (matched == notMatch)
                    assert.fail(`Hovering has something not expected.\n ${printLineWithRange(useCase, getRange(getHoveringAnnotation))}\n Expected: ${text}, but was: ${message}`);
            }
        });

        test("check completion", async () => {
            for (const getCompletionAnnotation of annotations.filter(it => it.action.type === 'Completion')) {
                const text = (getCompletionAnnotation.action as CompletionAction).text;
                const notMatch = (getCompletionAnnotation.action as CompletionAction).not ?? false;
                const completionList = await commands.executeCommand<CompletionList>('vscode.executeCompletionItemProvider', mainUri, {
                    line: getCompletionAnnotation.range.line,
                    character: getCompletionAnnotation.range.startChar,
                });
                const completions = completionList.items;
                if (completions.length == 0) {
                    if (notMatch) continue;
                    assert.fail(`Item ${text} is expected here, but there is no any.\n ${printLineWithRange(useCase, getRange(getCompletionAnnotation))}`);
                }
                const matched = completions.filter(item => item.label === text).length > 0;
                if (matched == notMatch)
                    assert.fail(`Completion has something not expected.\n ${printLineWithRange(useCase, getRange(getCompletionAnnotation))}\n Expected: ${text}, but was: ${completions.map(it => it.label)}`);
            }
        });

        test("check renamePrepare errors", async () => {
            for (const cantRenameAction of annotations.filter(it => it.action.type === 'CantRename')) {
                try {
                    await commands.executeCommand<Position>('vscode.prepareRename', mainUri, {
                        line: cantRenameAction.range.line,
                        character: cantRenameAction.range.startChar,
                    });
                } catch {
                    continue;
                }
                assert.fail(`It was expected that I can't rename an object here:\n ${printLineWithRange(useCase, getRange(cantRenameAction))}`);
            }
        });

        test("check renaming", async () => {
            for (const renameAction of annotations.filter(it => it.action.type === 'Rename')) {
                const workspaceEdit = await commands.executeCommand<WorkspaceEdit>('vscode.executeDocumentRenameProvider', mainUri, {
                    line: renameAction.range.line,
                    character: renameAction.range.startChar,
                }, (renameAction.action as RenameAction).newName);
                const edits = workspaceEdit.get(mainUri);
                assert.ok(edits, `No edits for the file uri for rename.\n${printLineWithRange(useCase, getRange(renameAction))}`);
                const expectedEdits = annotations.filter(it => it.name === (renameAction.action as RenameAction).result);
                assert.equal(edits.length, expectedEdits.length, `For case:\n${printLineWithRange(useCase, getRange(renameAction))}`);
                for (const expectedEdit of expectedEdits) {
                    const expectedRange = getRange(expectedEdit);
                    assert.equal(edits.filter(it => it.range.isEqual(expectedRange)).length, 1, 
                    `Can't find rename for:\n${printLineWithRange(useCase, expectedRange)}`);
                }
            }
        });

        // all vscode commands here https://code.visualstudio.com/api/references/commands
    });
}

suite('Test include', () => {
    const includeFolder = path.resolve(fixturesFolder, 'include');

    test('Definitions are correct', async () => {
        const mainUri = getDocUri(path.resolve(includeFolder, 'simple.asm'));
        await openUseCaseFile(mainUri);

        const theLinkDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
            line: 1,
            character: 12,
        });
        assert.ok(theLinkDefinitions, 'No theLink definitions');
        assert.strictEqual(theLinkDefinitions.length, 1, "theLink definitions size");
        const theLinkDefinition = theLinkDefinitions[0];
        assert.deepEqual(theLinkDefinition.uri, getDocUri(path.resolve(includeFolder, 'simpleInclude.asm')));
        assert.deepEqual(theLinkDefinition.range, constructRange(0, 0, 7));

        const includeFileDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
            line: 0,
            character: 20,
        });
        assert.ok(includeFileDefinitions, 'No include file definitions');
        assert.strictEqual(includeFileDefinitions.length, 1, "include file definitions size");
        const includeFileDefinition = includeFileDefinitions[0];
        assert.deepEqual(includeFileDefinition.uri, getDocUri(path.resolve(includeFolder, 'simpleInclude.asm')));
        assert.deepEqual(includeFileDefinition.range, constructRange(0, 0, 0));

        const anotherDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
            line: 4,
            character: 12,
        });
        assert.ok(anotherDefinitions, 'No ANOTHER definitions');
        assert.strictEqual(anotherDefinitions.length, 1, 'another definitions size');
        const anotherDefinition = anotherDefinitions[0];
        assert.deepEqual(anotherDefinition.uri, getDocUri(path.resolve(includeFolder, 'some/another.asm')));
        assert.deepEqual(anotherDefinition.range, constructRange(0, 0, 7));

        // try to open that document
        await openUseCaseFile(anotherDefinition.uri);
        const openedFile = getOpendFileName() ?? "";
        assert.ok(openedFile.endsWith('another.asm'), `Opened file is ${openedFile}`);
    });

    test('Document symbols',async () => {
        const mainUri = getDocUri(path.resolve(includeFolder, 'simple.asm'));
        await openUseCaseFile(mainUri);
        
        const anotherUri = getDocUri(path.resolve(includeFolder, 'some/another.asm'));
        await openUseCaseFile(anotherUri);

        const anotherSymbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', anotherUri);
        assert.ok(anotherSymbols, 'No symbols for "another" file');
        assert.equal(anotherSymbols.length, 1, 'One symbol in "another"');
        assert.equal(anotherSymbols[0].name, 'ANOTHER', 'Check symble name');
    });

    test('Include working with non string literals',async () => {
        const mainUri = getDocUri(path.resolve(includeFolder, 'simpleWithoutQuotes.asm'));
        await openUseCaseFile(mainUri);
        const actualErrors = await getErrors(mainUri, 0);
        assert.deepEqual(actualErrors, []);
    });

    // There is a bug in VSCode with cleaning diagnostics
    test.skip('Errors dissapear on closing', async () => {
        const mainUri = getDocUri(path.resolve(includeFolder, 'withError.asm'));
        await openUseCaseFile(mainUri);
        let errors = await getErrors(mainUri, 0);
        assert.equal(errors.length, 0);
        const includeUri = getDocUri(path.resolve(includeFolder, 'errorInclude.asm'));
        const includeError = (await getErrors(includeUri, 1))[0];
        assert.deepEqual(includeError.message, 'Label is not defined');
        await commands.executeCommand('workbench.action.closeActiveEditor');
        errors = await getErrors(mainUri, 0);
        assert.equal(errors.length, 0);
        errors = await getErrors(includeUri, 0);
        assert.equal(errors.length, 0);
    });

    const parallelIncludeFolder = path.resolve(fixturesFolder, 'parallelInclude');

    test('Include files in parallel', async () => {
        const mainUri = getDocUri(path.resolve(parallelIncludeFolder, 'main.asm'));
        await openUseCaseFile(mainUri);
        const mainErrors = await getErrors(mainUri, 0);
        assert.equal(mainErrors.length, 0);
        const usageUri = getDocUri(path.resolve(parallelIncludeFolder, 'usage.asm'));
        await openUseCaseFile(usageUri);
        const usageErrors = await getErrors(usageUri, 0);
        assert.equal(usageErrors.length, 0);
        // the INDIRECT_VAR is available for autocompletion
        const completionList = await commands.executeCommand<CompletionList>('vscode.executeCompletionItemProvider', mainUri, {
            line: 2,
            character: 0,
        });
        const indirectVarItems = completionList.items.filter(it => it.label === 'INDIRECT_VAR');
        assert.ok(indirectVarItems.length > 0);
    });

    const incdirForMacroFolder = path.resolve(fixturesFolder, 'incdirForMacro');

    test('Include directories for macros',async () => {
        const mainUri = getDocUri(path.resolve(incdirForMacroFolder, 'main.asm'));
        await openUseCaseFile(mainUri);
        const mainErrors = await getErrors(mainUri, 0);
        assert.equal(mainErrors.length, 0);
    });
});

function printLineWithRange(useCase: UseCase, range: Range): string {
    const linePrefix = ' ' + (range.start.line + 1) + ' : ';
    const sourceLine = useCase.getFixtureContent().split('\n')[range.start.line];
    const spaces = ' '.repeat(linePrefix.length);
    return "Source position: \n" + linePrefix + sourceLine + "\n" + spaces + markPosition(range);
}

function markPosition(range: Range): string {
    if (range.end.character == range.start.character) {
        return ' '.repeat(range.start.character-1) + '><';
    } else {
        return ' '.repeat(range.start.character) + '~'.repeat(range.end.character - range.start.character);
    }
}

function getRange(useCaseAnnotation: UseCaseAnnotation) {
    const range = useCaseAnnotation.range;
    return constructRange(range.line, range.startChar, range.length);
}

function checkDefRef(useCase: UseCase, expectedResults: UseCaseAnnotation[], actualResults: Location[] | undefined, name: string) {
    for (const expectedResult of expectedResults) {
        const expectedRange = getRange(expectedResult);
        const actualResult = actualResults?.find(it => it.range.isEqual(expectedRange));
        if (actualResult === undefined)
            assert.fail(`This ${name} was expected, but not shown.\n ${printLineWithRange(useCase, expectedRange)}`);
    }
    if (actualResults === undefined) assert.fail("This is impossible!");
    for (const actualResult of actualResults) {
        const expectedResult = expectedResults.find(it => getRange(it).isEqual(actualResult.range));
        if (expectedResult === undefined)
            assert.fail(`This ${name} is not expected.\n ${printLineWithRange(useCase, actualResult.range)}`);
    }
}
