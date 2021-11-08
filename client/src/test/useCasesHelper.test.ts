import { UseCase } from "./useCasesHelper"
import * as assert from 'assert';


describe('Use case helper', () => {
    it('works', () => {
        const action = {
            type: 'Error' as 'Error',
            message: 'Some'
        }
        const useCase = new UseCase("name", {
            text: 
`foo bar
ba{zz|asd} {other|asd} {|asd}
qwe{r|asd}`,
            actions: {asd: action}
        })
        assert.strictEqual(useCase.getFixtureContent(), 
`foo bar
bazz other 
qwer`)
        assert.deepStrictEqual(useCase.getAnnotations(), [{
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 2, length: 2}
            }, {
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 5, length: 5}
            }, {
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 11, length: 0}
            }, {
                action: action,
                name: 'asd',
                range: {line: 2, startChar: 3, length: 1}
            }
        ])
    })
}) 