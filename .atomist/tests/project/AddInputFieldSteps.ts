import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const CERTAIN_INPUT_FILEPATH = "hello.txt";

// there should be a better way, to put this in a real Elm file,
// I don't have the brainspace to find that way right now
const CERTAIN_FILE_CONTENT_BEFORE = `module BeginnerProgram exposing (..)

import Html exposing (Html)


-- MODEL


type alias Model =
    {}


model : Model


init =
    {}



-- MESSAGES


type Msg
    = NoOp



-- VIEW


view : Model -> Html Msg
view model =
    Html.div [] []



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
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

const CERTAIN_FILE_CONTENT_AFTER = `module BeginnerProgram exposing (..)

import Html exposing (Html)
import Html.Events


-- MODEL


type alias Model =
    { newLabel : String }


model : Model


init =
    { newLabel = "" }



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
        [ Html.attributes.id "newLabel"
        , Html.Events.onInput NewLabel
        , Html.Attributes.value model.newLabel
        ]



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
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

Given("a project with a certain file", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_BEFORE);
});

When("the AddInputField is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddInputField");
    w.editWith(editor, { name: "newLabel" });
});

Then("that certain file looks different", (p: Project, world) => {
    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});
