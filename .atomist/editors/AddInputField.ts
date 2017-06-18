import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * Sample TypeScript editor used by AddAddInputField.
 */
@Editor("AddInputField", "add a text input field to an Elm program")
@Tags("documentation")
export class AddInputField implements EditProject {

    @Parameter({
        displayName: "Name of the field",
        description: "the model field that will hold the input",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
    })
    public name: string;

    public edit(project: Project) {
        const certainFile = project.findFile("hello.txt");
        const newContent = certainFile.content.replace(/the world/, this.name);
        certainFile.setContent(newContent);
    }
}

export const addInputField = new AddInputField();
