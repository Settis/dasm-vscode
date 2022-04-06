import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateCstDts } from "chevrotain";
import { DASM_PARSER } from "./parser";

const dtsString = generateCstDts(DASM_PARSER.getGAstProductions());
const dtsPath = resolve(__dirname, "..", "..", "..", "src", "parser", "cst", "cstTypes.ts");
writeFileSync(dtsPath, dtsString);