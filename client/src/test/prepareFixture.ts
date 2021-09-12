import * as fs from 'fs';
import { readUseCases, recreateFixtureFolder } from "./useCasesHelper";

function main() {
    recreateFixtureFolder();
    for (const useCase of readUseCases()) {
        fs.mkdirSync(useCase.getUseCaseFolder());
        fs.writeFileSync(useCase.getMainFile(), useCase.getFixtureContent());
    }
}

try {
    main();
} catch (err) {
    console.error(`Failed to create fixture: ${err}`);
    process.exit(1);
}
