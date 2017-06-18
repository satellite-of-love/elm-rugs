import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import {ElmProgram} from "./elm/ElmProgram";


const ON_ENTER = `onEnter : Msg -> Html.Attributes Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.Decode.succeed msg
            else
                Json.Decode.fail "not ENTER"
    in
        on "keydown" (Json.Decode.andThen isEnter Html.Events.keyCode)`;


/**
 * Bring in the onEnter function.
 */
@Editor("OnEnter", "add a message to receive on enter, and a function to send it")
@Tags("elm")
export class OnEnter implements EditProject {

    @Parameter({
        displayName: "Some Input",
        description: "example of how to specify a parameter using decorators",
        pattern: Pattern.any,
        validInput: "a description of the valid input"
    })
    public message: string = "`none`";

    public targetFile: string = 'src/Main.elm';

    public edit(project: Project) {
        const certainFile = project.findFile(this.targetFile);

        if (certainFile.content.indexOf(ON_ENTER) >= 0) {
            return;
        }

        const elmProgram = ElmProgram.parse(project, this.targetFile);

        elmProgram.addImport("Json.Decode");
        elmProgram.addImport("Html.Events");
        elmProgram.addFunction(ON_ENTER, "VIEW");
        if (this.message !== "`none`") {
            elmProgram.addMessage({constructor: this.message});
        }

    }
}

export const onEnter = new OnEnter();
