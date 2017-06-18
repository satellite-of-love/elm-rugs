import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {showResult} from "./AddTextInputSteps";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_AFTER = `module BeginnerProgram exposing (main)

import Html exposing (Html)
import Html.Events
import Json.Decode


-- MODEL


type alias Model =
    {}


init : Model
init =
    {}



-- MESSAGES


type Msg
    = NoOp
    | SaveMe



-- VIEW


view : Model -> Html Msg
view model =
    Html.div [] []


onEnter : Msg -> Html.Attribute Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.Decode.succeed msg
            else
                Json.Decode.fail "not ENTER"
    in
        Html.Events.on "keydown" (Json.Decode.andThen isEnter Html.Events.keyCode)



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
            model

        SaveMe ->
            model



-- MAIN


main : Program Never Model Msg
main =
    Html.beginnerProgram
        { model = init
        , view = view
        , update = update
        }
`;


When("the OnEnter is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("OnEnter");
    w.editWith(editor, { message: "SaveMe" });
});

Then("we have a beginner program that can get a message on Enter", (p: Project, world) => {
    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        showResult(CERTAIN_FILE_CONTENT_AFTER, after, CERTAIN_INPUT_FILEPATH)
    }
    return passing;
});
