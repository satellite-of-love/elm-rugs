import {Project} from "@atomist/rug/model/Core";
import {Editor, Tags, Parameter} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {ElmProgram} from "./elm/ElmProgram";
import {Pattern} from "@atomist/rug/operations/RugOperation";

/**
 * Upgradinate
 */
@Editor("Upgrade", "from beginner program to advanced")
@Tags("documentation")
export class Upgrade implements EditProject {

    @Parameter({
        displayName: "Main file",
        description: "where is main?",
        pattern: Pattern.any,
        validInput: "path to a .elm file",
    })
    public mainFile: string = "src/Main.elm";


    public edit(project: Project) {
        const elmProgram = ElmProgram.parse(project, this.mainFile);
        elmProgram.upgrade();
    }
}

export const upgrade = new Upgrade();
