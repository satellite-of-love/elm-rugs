import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { ElmProgram } from "./elm/ElmProgram";

/**
 * Sample TypeScript editor used by AddAddToModel.
 */
@Editor("AddToModel", "add a field to the model")
@Tags("documentation")
export class AddToModel implements EditProject {

    @Parameter({
        displayName: "Field Name",
        description: "name of the new field",
        pattern: Pattern.any,
        validInput: "an Elm identifier",
    })
    public name: string;

    @Parameter({
        displayName: "Field Type",
        description: "type of the new field",
        pattern: Pattern.any,
        validInput: "an Elm type",
    })
    public type: string;

    @Parameter({
        displayName: "Initial Value",
        description: "starting value of the new field",
        pattern: Pattern.any,
        validInput: "an Elm expression",
    })
    public value: string;

    public edit(project: Project) {
        const elmProgram = ElmProgram.parse(project, "src/Main.elm");
        elmProgram.addModelField(this.name, this.type, this.value);
    }
}

export const addToModel = new AddToModel();
