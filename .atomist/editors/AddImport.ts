import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { TextTreeNode } from "@atomist/rug/tree/PathExpression";
import {ElmProgram} from "./elm/ElmProgram";

/**
 * Sample TypeScript editor used by AddAddImport.
 */
@Editor(AddImport.editorName, "add an import")
@Tags("documentation")
export class AddImport implements EditProject {

    static editorName = "AddImport";

    @Parameter({
        displayName: "Module to import",
        description: "the module to import, like Html.Attributes",
        pattern: Pattern.any,
        validInput: "an Elm module name",
        minLength: 1,
        maxLength: 100,
    })
    public import: string;

    public targetFile = "src/Main.elm";

    public edit(project: Project) {


        const elmProgram = ElmProgram.parse(project, this.targetFile);
        if (elmProgram.addImport(this.import)) {
            console.log(`Added import of ${this.import} to ${this.targetFile}`);
        } else {
            console.log(`${this.import} is already imported in ${this.targetFile}`)
        }

    }


}

export const addImport = new AddImport();
