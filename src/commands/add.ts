import files from "../utils/files";
import { prompt } from "inquirer";
import chalk from "chalk";
import { getPath } from "./path";
import { join } from "path";
import { readJson, writeJson } from "../utils/json-reader";
import { existsSync } from "fs";

const questions = {
    "qSnippetType": {
        name: "_qSnippetType",
        message: "What is the type of snippet that you want to create",
        default: "javascript"
    },
    "qSnippetName": {
        name: "_qSnippetName",
        message: "What is the name of the snippet"
    },
    "qSnippetPrefix": {
        name: "_qSnippetPrefix",
        message: "What is the prefix for the snippet"
    },
    "qSnippetBody": {
        name: "_qSnippetBody",
        message: "Enter the snippet code",
    },
    "qSnippetDescription": {
        name: "_qSnippetDescription",
        message: "What is the description of the snippet"
    }
};

let snippet = {};


export function addSnippet() {
    getSnippetType(() => { getSnippetName(() => { getSnippetPrefix(() => { getSnippetDescription(() => { getSnippetBody(() => { addSnippetToFile() }) }) }) }) });
}

function addSnippetToFile() {
    const path = getPath();
    if (!path) {
        return;
    } else {
        const filePath = join(path, `${snippet["type"]}.json`);
        if (!existsSync(filePath)) {
            console.log(chalk.red(`Error : The path ${filePath} is not found`));
            return;
        }
        // Read the json file
        let initSnippets = readJson(filePath);
        if (!initSnippets) {
            initSnippets = {};
        }
        initSnippets[snippet["name"]] = { prefix: snippet["prefix"], body: snippet["body"], description: snippet["description"], id: "" + Math.random() };
        writeJson(filePath, initSnippets);
        console.log(chalk.yellow(`+ Added one snippet in ----> ${filePath}`));
    }
}

//  Get the snippet type
async function getSnippetType(_next: () => void) {
    const { _qSnippetType } = await prompt(questions["qSnippetType"]);
    const _type = _qSnippetType.trim().toLowerCase();
    validate("type", _type, getSnippetType, _next);
}

// Get the snippet name
async function getSnippetName(_next: () => void) {
    const { _qSnippetName } = await prompt(questions["qSnippetName"]);
    const _name = _qSnippetName.trim().toLowerCase();
    validate("name", _name, getSnippetName, _next);
}

// Get the snippet prefix
async function getSnippetPrefix(_next: () => void) {
    const { _qSnippetPrefix } = await prompt(questions["qSnippetPrefix"]);
    const _prefix = _qSnippetPrefix.trim().toLowerCase();
    validate("prefix", _prefix, getSnippetPrefix, _next);
}

// Get the snippet body
async function getSnippetBody(_next: () => void) {
    const { _qSnippetBody } = await prompt({ ...questions["qSnippetBody"], type: "editor" });
    const _body = _qSnippetBody.trim().toLowerCase();
    validate("body", _body, getSnippetBody, _next);
}

// Get the description
async function getSnippetDescription(_next: () => void) {
    const { _qSnippetDescription } = await prompt({ ...questions["qSnippetDescription"], default: snippet["name"] });
    const _description = _qSnippetDescription.trim().toLowerCase();
    validate("description", _description, getSnippetDescription, _next);
}


// Validate check if the propvalue is empty
function validate(propName: "name" | "message" | "prefix" | "body" | "type" | "description", propValue: string, selfFunction: (_next: () => void) => void, nextFunction: () => void) {
    propValue = propValue.trim().toLocaleLowerCase();
    if (propValue.length === 0) {
        console.log(chalk.red(`Error : ${propName} can't be empty`));
        selfFunction(nextFunction);
    } else {
        if (propName === "prefix") {
            if (propValue.indexOf(" ") !== -1) {
                console.log(chalk.red(`Error : Prefix cant contain spaces`));
                selfFunction(nextFunction);
                return;
            } else {
                snippet[propName] = propValue;
                nextFunction();
                return;
            }
        }

        if (propName === "type") {
            for (let i = 0; i < files.length; i++) {
                if (files[i].file === propValue) {
                    snippet[propName] = propValue;
                    nextFunction();
                    return;
                }
            }
            console.log(chalk.red(`Error : The type ${propValue} is not supported`));
            selfFunction(nextFunction);
            return;
        }
        snippet[propName] = propValue;
        nextFunction();
    }
}