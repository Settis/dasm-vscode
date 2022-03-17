import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateCstDts } from "chevrotain";
import { UseCaseParser } from "./useCaseParser";

const dtsString = generateCstDts(new UseCaseParser().getGAstProductions());
const dtsPath = resolve(__dirname, "..", "..", "src", "test", "useCaseParserTypes.ts");
writeFileSync(dtsPath, dtsString);
