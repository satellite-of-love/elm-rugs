import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import { ElmProgram } from "../../editors/elm/ElmProgram";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_BEFORE = `module Main exposing (main)


-- MODEL


type alias Model =
    {}


init : Model
init =
    {}
`;

const CERTAIN_FILE_CONTENT_AFTER = `module Main exposing (main)


-- MODEL


type alias Model =
    { count: Int }


init : Model
init =
    { count = 0 }
`;

const TWO_FIELDS = `module Main exposing (main)


-- MODEL


type alias Model =
    { count: Int, messages: List String }


init : Model
init =
    { count = 0, messages: [] }
`;

//    Given an Elm program with an empty model
// When the AddToModel is run
// Then parameters were valid
// Then changes were made
// Then the field is in the initial model
// Then the field is in the model's type

Given("an Elm program with an empty model", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_BEFORE);
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    return elmProgram.modelFields.length === 0;
});

When("the AddToModel is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddToModel");
    w.editWith(editor, { name: "count", type: "Int", value: "0" });
});

Given("an Elm program with a field in the model", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_AFTER);
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
});

Then("we can detect a model field", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;

    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const result = elmProgram.modelFields.length === 1 &&
        elmProgram.modelFields[0].name === "count" &&
        elmProgram.modelFields[0].type === "Int";
    if (!result) {
        console.log(`There are ${elmProgram.modelFields.length} fields`);
        elmProgram.modelFields.forEach((f) =>
            console.log(`${f.name}: ${f.type},`));
    }
    return result;
});

Given("an Elm program with 2 fields in the model", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, TWO_FIELDS);
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
});

Then("we can detect 2 model fields", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;

    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const result = elmProgram.modelFields.length === 2 &&
        elmProgram.modelFields[0].name === "count" &&
        elmProgram.modelFields[0].type === "Int";
    if (!result) {
        console.log(`There are ${elmProgram.modelFields.length} fields`);
        elmProgram.modelFields.forEach((f) =>
            console.log(`${f.name}: ${f.type},`));
    }
    return result;
});

Then("the field is in the initial model", (p: Project, world) => {
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const passing = elmProgram.modelFields.length === 1 &&
        elmProgram.modelFields[0].name === "count" &&
        elmProgram.modelFields[0].type === "Int";

    if (!passing) {
        const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});
