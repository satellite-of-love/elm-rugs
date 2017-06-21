import {Project} from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {ElmProgram} from "../../editors/elm/ElmProgram";
import {showResult} from "./AddTextInputSteps";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_BEFORE = `module Main exposing (main)


-- UPDATE


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
    { count: { total : Int }
    , messages : List String }


init : Model
init =
    { count = { total = 0 }
    , messages = [] }
`;

const THREE_FIELDS = `module Main exposing (main)


-- MODEL


type alias Model =
    { count: { total : Int }
    , messages : List String, banana : String }


init : Model
init =
    { count = { total = 0 }
    , messages = [], banana = "yellow" }
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
    w.editWith(editor, {name: "banana", type: "String", value: "\"yellow\""});
});

Given("an Elm program with a field in the model", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_AFTER);
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
});

Then("we can detect a model field", (p: Project, world) => {

    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const result = elmProgram.modelFields.length === 1 &&
        elmProgram.modelFields[0].name === "count" &&
        elmProgram.modelFields[0].type.value() === "Int" &&
        elmProgram.modelFields[0].initialization.value() === "0";
    if (!result) {
        printFields(elmProgram);
    }
    return result;
});

function printFields(elmProgram) {
    console.log(`There are ${elmProgram.modelFields.length} fields`);
    elmProgram.modelFields.forEach((f) => {
        console.log(JSON.stringify(f));
        console.log(`${f.name}: ${f.type.value()} = ${f.initialization.value()}`)
    });
}

Given("an Elm program with 2 fields in the model", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, TWO_FIELDS);
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH); // we can parse
});

Then("we can detect 2 model fields", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;

    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const result = elmProgram.modelFields.length === 2;
    if (!result) {
        printFields(elmProgram);
    }
    return result;
});

Then("the field is in the model's type", (p: Project, world) => {
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const passing = elmProgram.modelFields.filter((mf) => mf.name === "banana" &&
        mf.type.value() === "String").length === 1;

    if (!passing) {
        const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});

Then("the field is in the initial model", (p: Project, world) => {
    try {
        const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);

        const passing = elmProgram.modelFields.filter((mf) => mf.name === "banana" &&
            mf.initialization.value() === `"yellow"`).length === 1;

        if (!passing) {
            const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
            console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
        }
        return passing;
    } catch (e) {
        console.log(e.getMessage());
        throw e;
    }
});

Then("the third field is there", (p: Project) => {
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);
    const passing = elmProgram.modelFields.filter((mf) => mf.name === "banana" &&
        mf.initialization.value() === `"yellow"` &&
        mf.type.value() === "String").length === 1;

    if (!passing) {
        const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});

Then("it looks like this three fields", (p: Project) => {
        const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
        const passing = (after === THREE_FIELDS);
        if (!passing) {
            showResult(THREE_FIELDS, after, CERTAIN_INPUT_FILEPATH)
        }
        return passing;
    }
)