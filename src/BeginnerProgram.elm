module BeginnerProgram exposing (..)

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
