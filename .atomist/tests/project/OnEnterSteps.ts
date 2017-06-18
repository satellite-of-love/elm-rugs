import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_AFTER = `module BeginnerProgram exposing (..)

import Html exposing (Html)


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


onEnter : Msg -> Attribute Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.succeed msg
            else
                Json.fail "not ENTER"
    in
        on "keydown" (Json.andThen isEnter keyCode)



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
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});
