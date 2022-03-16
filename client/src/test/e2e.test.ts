import { ErrorAction, fixturesFolder, GetDefinitionAction, GetUsagesAction, readUseCases, UseCase, UseCaseAnnotation } from "./useCasesHelper";
import { constructRange, getDocUri, getErrors, openUseCaseFile } from './vscodeHelper';
import * as assert from 'assert';
import * as path from 'path';
import { Range, DiagnosticSeverity, commands, Location } from "vscode";

const useCases = readUseCases();

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
                        // Nothing to check here
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
        const anotherDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
            line: 4,
            character: 12,
        });
        assert.ok(anotherDefinitions, 'No ANOTHER definitions');
        assert.strictEqual(anotherDefinitions.length, 1, 'another definitions size');
        const anotherDefinition = anotherDefinitions[0];
        assert.deepEqual(anotherDefinition.uri, getDocUri(path.resolve(includeFolder, 'some/another.asm')));
        assert.deepEqual(anotherDefinition.range, constructRange(0, 0, 7));
    });

    test('Errors dissapear on closing', async () => {
        const mainUri = getDocUri(path.resolve(includeFolder, 'withError.asm'));
        await openUseCaseFile(mainUri);
        await getErrors(mainUri, 0);
        const includeUri = getDocUri(path.resolve(includeFolder, 'errorInclude.asm'));
        const includeError = (await getErrors(includeUri, 1))[0];
        assert.deepEqual(includeError.message, 'Label is not defined');
        await commands.executeCommand('workbench.action.closeActiveEditor');
        await getErrors(mainUri, 0);
        await getErrors(includeUri, 0);
    });
});

function printLineWithRange(useCase: UseCase, range: Range): string {
    const linePrefix = ' ' + (range.start.line + 1) + ' : ';
    const sourceLine = useCase.getFixtureContent().split('\n')[range.start.line];
    const spaces = ' '.repeat(linePrefix.length + range.start.character);
    const underscore = '~'.repeat(range.end.character - range.start.character);
    return "Source position: \n" + linePrefix + sourceLine + "\n" + spaces + underscore;
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
