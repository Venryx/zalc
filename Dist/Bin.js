#!/usr/bin/env node
import fs from "fs";
import paths from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { globbySync } from "globby";
// Intercept filter call that modifies the "filesToCopy" array in copy.ts: https://github.com/wclr/yalc/blob/12e3ef38fb4d03389c07baa8060584ec1e7ea176/src/copy.ts#L155
const filter_orig = Array.prototype.filter;
Array.prototype.filter = function (...args) {
    const [func] = args;
    const result = filter_orig.apply(this, args);
    if (func.toString().includes("return !ignoreRule.ignores(f);")) {
        const workingDir = process.cwd();
        const yalcIgnoreFilePath = paths.join(workingDir, ".yalcignore");
        if (fs.existsSync(yalcIgnoreFilePath)) {
            const yalcIgnoreStr = fs.readFileSync(yalcIgnoreFilePath).toString().replace(/\r/g, "");
            const yalcIgnoreLines = yalcIgnoreStr.split("\n");
            const yalcIncludePatterns = yalcIgnoreLines.filter(a => a.startsWith("!")).map(a => a.replace("!", ""));
            //console.log("Test1:", yalcIncludePatterns);
            const yalcIncludePaths = globbySync(yalcIncludePatterns, { dot: true });
            let zalcAddedFiles = 0;
            for (const path of yalcIncludePaths) {
                if (!result.includes(path)) {
                    //console.log("Adding:", path);
                    result.push(path);
                    zalcAddedFiles++;
                }
            }
            if (zalcAddedFiles > 0) {
                console.log(`Zalc added ${zalcAddedFiles} additional files to the yalc publish, based on exclusions in the .yalcignore file.`);
            }
        }
    }
    return result;
};
require("yalc/src/yalc.js");
