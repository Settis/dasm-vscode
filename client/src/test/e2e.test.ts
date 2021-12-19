import { ErrorAction, readUseCases, UseCase, UseCaseAnnotation } from "./useCasesHelper";
import { constructRange, getDocUri, getErrors, openUseCaseFile } from './vscodeHelper';
import * as assert from 'assert';
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
            for (const annotation of annotations) {
                const action = annotation.action;
                if (action.type !== 'GetDefinition') continue;
                const actualDefinitions = await commands.executeCommand<Location[]>('vscode.executeDefinitionProvider', mainUri, {
                    line: annotation.range.line,
                    character: annotation.range.startChar,
                });
                if (actualDefinitions === undefined && action.result === null) continue;
                const expectedResults = annotations.filter(it => it.name === action.result);

                for (const expectedResult of expectedResults) {
                    const expectedRange = getRange(expectedResult);
                    const actualResult = actualDefinitions?.find(it => it.range.isEqual(expectedRange));
                    if (actualResult === undefined)
                        assert.fail(`This definition was expected, but not shown.\n ${printLineWithRange(useCase, expectedRange)}`);
                }
                if (actualDefinitions === undefined) assert.fail("This is impossible!");
                for (const actualResult of actualDefinitions) {
                    const expectedResult = expectedResults.find(it => getRange(it).isEqual(actualResult.range));
                    if (expectedResult === undefined)
                        assert.fail(`This definition is not expected.\n ${printLineWithRange(useCase, actualResult.range)}`);
                }
            }
        });

        test("check references", () => {
            // something
        });

        // all vscode commands here https://code.visualstudio.com/api/references/commands
    });
}

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
