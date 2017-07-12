import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {ElmProgram} from "../../editors/elm/ElmProgram";

When("the UpgradeToBeginnerProgram is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    try {
        const editor = w.editor("UpgradeToBeginnerProgram");
        w.editWith(editor, {inputParameter: "the inputParameter value"});
    } catch (e) {
        console.log(e.getMessage());
        throw e
    }
});

When("adding a function that returns Html Never", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddFunction");
    w.editWith(editor, { name: "friendly", type: "Html Never", body: "Html.div [] []" });
});

Then("the type of main is (.*)", (p: Project, world: ProjectScenarioWorld, desiredType: string) => {
    const elmProgram = ElmProgram.parse(p);
    return elmProgram.programLevel === "beginner" &&
        elmProgram.getFunction("main").declaredType.value() === desiredType;
});

Then("the type of that function is Html Msg", (p: Project, world: ProjectScenarioWorld, desiredType: string) => {
    const mainElm = p.findFile("src/Main.elm").content;

    const m = mainElm.match(/^friendly : (.*)$/m);
    const friendlyFunctionType = m[1];
    return (friendlyFunctionType === "Html Msg");
});


const STATIC_PAGE_WITH_FUNCTION = `module Main exposing (main)

import Html exposing (Html)


diagram =
   "elm.png"

main : Html Never
main =
    Html.div [] []
`;


Given("a project with a static program that defines something before main", (p: Project) => {
    p.addFile("src/Main.elm", STATIC_PAGE_WITH_FUNCTION);
    p.addFile("elm-package.json", "");
});

Then("the function defined before main is included in the output", (p: Project) => {
    return p.findFile("src/Main.elm").content.indexOf("diagram =") > 0
});