import { readUseCases, UseCase, UseCaseAnnotation } from "./useCasesHelper";
import { constructRange, getDocUri, getErrors, openUseCaseFile } from './vscodeHelper';
import * as assert from 'assert';
import { Range, DiagnosticSeverity } from "vscode";

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
                
                    default:
                        assert.fail(`Unknown action type ${action.type}`);
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
            const expectedErrors = annotations.filter((it) => { return it.action.type == 'Error'; });
            const actualErrors = await getErrors(mainUri, expectedErrors.length);
            for (const expectedError of expectedErrors) {
                const rangeJson = JSON.stringify(getRange(expectedError));
                const actualError = actualErrors.find(it => JSON.stringify(it.range) === rangeJson);
                if (actualError) {
                    assert.strictEqual(actualError.message, expectedError.action.message, printLineWithRange(useCase, actualError.range));
                    const actualSeverity = DiagnosticSeverity[actualError.severity];
                    assert.strictEqual(actualSeverity, expectedError.action.severity, printLineWithRange(useCase, actualError.range));
                } else {
                    assert.fail(`This error is expected, but not found.\n ${printLineWithRange(useCase, getRange(expectedError))}\n ${expectedError.action.severity} : ${expectedError.action.message}`);
                }
            }
            for (const actualError of actualErrors) {
                const rangeJson = JSON.stringify(actualError.range);
                const expectedError = expectedErrors.find(it => JSON.stringify(getRange(it)) == rangeJson);
                if (!expectedError)
                    assert.fail(`This error is not expected.\n ${printLineWithRange(useCase, actualError.range)}\n ${DiagnosticSeverity[actualError.severity]} : ${actualError.message}`);
            }
        });

        test("check other", () => {
            // nothing to check
        });
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
