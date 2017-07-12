import {Project} from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
import {ElmProgram} from "../../../editors/elm/ElmProgram";

const Main = `module BeginnerProgram exposing (..)

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

Given("a project with this Elm program for testing ElmProgram", (p: Project) => {
    p.addFile("src/Main.elm", Main);
});

Then("the Elm program is understood", (p: Project) => {
    // add tests as needed.
    const program = ElmProgram.parse(p, "src/Main.elm");

    const modelSection = program.getSection("MODEL");
    if (!modelSection) {
        console.log("Model section not detected");
        return false;
    }

    if(modelSection.typeAliases.length !== 1) {
        console.log(`Found ${modelSection.typeAliases.length} type aliases`);
        return false;
    }

    const modelType = modelSection.typeAliases[0];
    return beTheSame(`Model`, modelType.name.value()) && beTheSame(`{}`, modelType.body.value());
});

function beTheSame(expected: string, actual: string): boolean {
    const result = expected === actual;
    if (!result) {
        console.log(`Expected: <${expected}>\nActual: <${actual}>`);
    }
    return result;
}