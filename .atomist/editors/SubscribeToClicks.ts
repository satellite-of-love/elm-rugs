import {Project} from "@atomist/rug/model/Core";
import {Editor, Tags, Parameter} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {ElmProgram} from "./elm/ElmProgram";
import {Pattern} from "@atomist/rug/operations/RugOperation";

const MOUSE_DEPENDENCY = `"elm-lang/mouse": "1.0.1 <= v < 2.0.0"`;

@Editor("SubscribeToClicks", "add a subscription to mouse clicks")
@Tags("elm")
export class SubscribeToClicks implements EditProject {

    @Parameter({
        displayName: "Main file",
        description: "where is main?",
        pattern: Pattern.any,
        validInput: "path to a .elm file",
    })
    public mainFile: string = "src/Main.elm";


    public edit(project: Project) {
        addDependency(project, MOUSE_DEPENDENCY)

        const elmProgram = ElmProgram.parse(project, this.mainFile);
        elmProgram.addImport("Mouse");
        elmProgram.addMessage({
            constructor: "Click Mouse.Position",
            deconstructor: "Click position",
            updatedModel: "{ model | lastClick = Just position }"
        });

        elmProgram.addModelField("lastClick", "Maybe Mouse.Position", "Nothing");

        elmProgram.addSubscription("Mouse.clicks Click")
    }
}

export function addDependency(project: Project, dep: String)  {
    const elmPackage = project.findFile("elm-package.json");
    const newContent = elmPackage.content.replace(
        `"elm-lang/core"`, dep + `,
        "elm-lang/core"`);
    elmPackage.setContent(newContent);
}

export const subscribeToClicks = new SubscribeToClicks();
