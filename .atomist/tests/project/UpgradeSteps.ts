import {Project} from "@atomist/rug/model/Project";
import {
    ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {ElmProgram} from "../../editors/elm/ElmProgram";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";


const CERTAIN_FILE_CONTENT_AFTER = `module Program exposing (main)

import Html exposing (Html)


-- MODEL


type alias Model =
    { count: Int }


init : ( Model, Cmd Msg )
init =
    ( { count = 0 }, Cmd.none )



-- MESSAGES


type Msg
    = NoOp



-- VIEW


view : Model -> Html Msg
view model =
    Html.div []
        []



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- MAIN


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
`;


When("the Upgrade is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("Upgrade");
    w.editWith(editor, {});
});

Then("we have an advanced program", (p: Project) => {
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);

    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = elmProgram.programLevel === "advanced" &&
        (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});
