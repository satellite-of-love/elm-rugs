import {Project} from "@atomist/rug/model/Project";
import {
    ProjectScenarioWorld, Then, When, Given
} from "@atomist/rug/test/project/Core";
import {ElmProgram} from "../../editors/elm/ElmProgram";
import {BEGINNER_PROGRAM_WITH_TEXT_INPUT, showResult} from "./AddTextInputSteps";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";


export const ADVANCED_ELM_PROGRAM = `module BeginnerProgram exposing (main)

import Html exposing (Html)
import Html.Attributes
import Html.Events


-- MODEL


type alias Model =
    { newLabel : String }


init : ( Model, Cmd Msg )
init =
    ( { newLabel = "" }, Cmd.none )



-- MESSAGES


type Msg
    = NoOp
    | NewLabel String



-- VIEW


view : Model -> Html Msg
view model =
    Html.div [] []


newLabelInput : Model -> Html Msg
newLabelInput model =
    Html.input
        [ Html.Attributes.id \"newLabel\"
        , Html.Events.onInput NewLabel
        , Html.Attributes.value model.newLabel
        ]
        []



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        NewLabel newLabel ->
            ( { model | newLabel = newLabel }, Cmd.none )



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

Given("an Elm beginner program with a text input", (p: Project) =>
    p.addFile(CERTAIN_INPUT_FILEPATH, BEGINNER_PROGRAM_WITH_TEXT_INPUT));

When("the Upgrade is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("Upgrade");
    w.editWith(editor, {});
});

Then("we have an advanced Elm project", (p: Project) => {
    const elmProgram = ElmProgram.parse(p, CERTAIN_INPUT_FILEPATH);

    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = elmProgram.programLevel === "advanced" &&
        (after === ADVANCED_ELM_PROGRAM);
    if (!passing) {
        showResult(ADVANCED_ELM_PROGRAM, after, CERTAIN_INPUT_FILEPATH);
    }
    return passing;
});
