import { readJson, writeJson } from "../utils/json-reader";
import files from "../utils/files";
import { join } from "path";
import chalk from "chalk";
import { getPath } from "./path";
import { existsSync } from "fs";

export function deleteSnippet(snippetId: string, snippetType: string) {
    const _path = getPath()
    if (!existsSync(_path)) {
        console.log(chalk.red(`Error : VisualStudioCode is not installed`));
        return;
    }
    if (!isTypeSupported(snippetType)) {
        console.log(chalk.red(`Error : The type ${snippetType} is not supported`));
        return;
    }
    const snippetFilePath = join(_path, `${snippetType}.json`);
    if (!existsSync(snippetFilePath)) {
        console.log(chalk.red(`No Snippets Found`));
        return;
    }
    let snippetData = readJson(snippetFilePath);
    if (!snippetData) {
        console.log(chalk.yellow(`No snippets in the file ----> ${snippetFilePath}`));
        return;
    }
    const keys = Object.keys(snippetData);
    const _keys = keys.filter((key) => snippetData[key]["id"] !== snippetId);
    const newSnippetsData = _keys.map((key) => snippetData[key]);
    writeJson(snippetFilePath, { ...newSnippetsData });
}

function isTypeSupported(file: string) {
    for (let f of files) {
        if (f.file === file) {
            return true;
        }
    }
    return false;
}