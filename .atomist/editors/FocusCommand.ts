import {File, Project} from "@atomist/rug/model/Core";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {ElmProgram} from "./elm/ElmProgram";
import {addDependency} from "./SubscribeToClicks";

const FOCUS_FUNCTION = `requestFocus : String -> Cmd Msg
requestFocus field_id =
    let
        handle result =
            case result of
                Ok () ->
                    NoOp

                Err (Dom.NotFound id) ->
                    FocusFieldNotFound id
    in
        Task.attempt handle (Dom.focus field_id)`;

const FOCUS_DEPENDENCY = `"elm-lang/dom": "1.0.1 <= v < 2.0.0"`;

/**
 * Sample TypeScript editor used by AddFocusCommand.
 */
@Editor("FocusCommand", "supply a command to set the focus on a field")
@Tags("documentation")
export class FocusCommand implements EditProject {

    public targetFile: string = "src/Main.elm";

    public edit(project: Project) {
        const elmProgram = ElmProgram.parse(project, this.targetFile);
        addDependency(project, FOCUS_DEPENDENCY);
        elmProgram.addImport("Dom");
        elmProgram.addImport("Task");
        elmProgram.addMessage({
            constructor: "FocusFieldNotFound String",
            deconstructor: "FocusFieldNotFound id"
        });
        elmProgram.addFunction(FOCUS_FUNCTION, "UPDATE");

    }
}

export const focusCommand = new FocusCommand();
