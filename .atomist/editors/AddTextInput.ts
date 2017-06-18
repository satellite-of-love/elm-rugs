import {File, Project} from "@atomist/rug/model/Core";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {ElmProgram} from "./elm/ElmProgram";

/**
 * Sample TypeScript editor used by AddAddTextInput.
 */
@Editor("AddTextInput", "add a text input field to an Elm program")
@Tags("documentation")
export class AddTextInput implements EditProject {

    @Parameter({
        displayName: "Name of the field",
        description: "the model field that will hold the input",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
    })
    public name: string;

    @Parameter({
        displayName: "Main file",
        description: "where is main?",
        pattern: Pattern.any,
        validInput: "path to a .elm file",
    })
    public mainFile: string = "src/Main.elm";

    public edit(project: Project) {
        const elmProgram = ElmProgram.parse(project, this.mainFile);

        if (elmProgram.programLevel !== "beginner") {
            throw new Error("This only works on a beginner program, yours is " + elmProgram.programLevel)
        }

        const fieldName = this.name;

        // capitalize :-(
        const constructorName = this.name.charAt(0).toUpperCase() + this.name.slice(1);

        elmProgram.addModelField(fieldName, "String", `""`);

        elmProgram.addMessage({
            constructor: constructorName + " String",
            deconstructor: `${constructorName} ${fieldName}`,
            updatedModel: `{ model | ${fieldName} = ${fieldName} }`
        })

        elmProgram.addImport("Html.Events");
        elmProgram.addImport("Html.Attributes");
        elmProgram.addFunction(
            `${fieldName}Input : Model -> Html Msg
${fieldName}Input model =
    Html.input
        [ Html.Attributes.id "${fieldName}"
        , Html.Events.onInput ${constructorName}
        , Html.Attributes.value model.${fieldName}
        ]
        []`, "VIEW"
        )
    }
}

export const addTextInput = new AddTextInput();
