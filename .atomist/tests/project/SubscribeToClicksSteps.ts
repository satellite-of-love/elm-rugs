import {Project} from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {ADVANCED_ELM_PROGRAM} from "./UpgradeSteps";
import {ElmProgram} from "../../editors/elm/ElmProgram";

/*
 Then lastClick is in the model, initialized to Nothing
 */

const ELM_PACKAGE_JSON = `{
    "version": "1.0.0",
    "summary": "helpful summary of your project, less than 80 characters",
    "repository": "https://github.com/jessitron/banana.git",
    "license": "BSD3",
    "source-directories": [
        "src"
    ],
    "exposed-modules": [],
    "dependencies": {
        "elm-lang/core": "5.0.0 <= v < 6.0.0",
        "elm-lang/html": "2.0.0 <= v < 3.0.0"
    },
    "elm-version": "0.18.0 <= v < 0.19.0"
}
`;

Given("an advanced Elm project", (p: Project) => {
    p.addFile("src/Main.elm", ADVANCED_ELM_PROGRAM);
    p.addFile("elm-package.json", ELM_PACKAGE_JSON)
});

When("the SubscribeToClicks is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("SubscribeToClicks");
    w.editWith(editor, {});
});

Then("there is a dependency on elm-lang/mouse", (p: Project) => {
    const after = p.findFile("elm-package.json").content;
    return (after.indexOf(`"elm-lang/mouse"`) > 0);
});

Then("Mouse is imported", (p: Project) => {
    const after = p.findFile("src/Main.elm").content;
    return (after.indexOf(`import Mouse`) > 0);
});

Then("there is a Click message", (p: Project) => {
    const elmProgram = ElmProgram.parse(p, "src/Main.elm");
    console.log("parsed ok");
    const messages = elmProgram.messages;
    console.log("got messages");
    const passing = messages.filter(
            m => m.constructor.value() === "Click Mouse.Position"
            && m.reactions[0].body.value() === "( { model | lastClick = Just position }, Cmd.none )"
        ).length === 1;
    if (!passing) {
        console.log(`There are ${messages.length} fields`);
        messages.forEach((f) => {
            const reactions = f.reactions.map(r => `${r.deconstructor.value()} leads to: ${r.body.value()}`);
            console.log(`${f.name.value()} from ${f.constructor.value()}, ${reactions.join("\n and ")}`);
        });
    }
    return passing;
});

Then("lastClick is in the model, initialized to Nothing", (p: Project) => {
    const after = p.findFile("src/Main.elm").content;
    return (after.indexOf(`lastClick = Nothing`) > 0);
});

Then("we subscribe to clicks", (p: Project) => {
    const after = p.findFile("src/Main.elm").content;
    return (after.indexOf(`Mouse.clicks Click`) > 0);
});
