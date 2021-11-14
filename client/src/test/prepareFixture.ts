import * as fs from 'fs';
import { readUseCases, recreateFixtureFolder } from "./useCasesHelper";

function main() {
    recreateFixtureFolder();
    for (const useCase of readUseCases()) {
        console.info(`Process use case: ${useCase.name}`);
        fs.mkdirSync(useCase.getUseCaseFolder());
        fs.writeFileSync(useCase.getMainFile(), useCase.getFixtureContent());
    }
}

try {
    main();
} catch (err) {
    console.error('Failed to create fixture:');
    console.error(err);
    process.exit(1);
}
