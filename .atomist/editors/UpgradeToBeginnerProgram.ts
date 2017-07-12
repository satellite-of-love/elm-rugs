import { Project } from "@atomist/rug/model/Project";
import { Editor, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { TextTreeNode } from "@atomist/rug/tree/PathExpression";
import { ElmProgram } from "./elm/ElmProgram";

/**
 * Sample TypeScript editor used by AddUpgradeToBeginnerProgram.
 */
@Editor("UpgradeToBeginnerProgram", "Turn a static page into an interactive page")
@Tags("elm")
export class UpgradeToBeginnerProgram implements EditProject {

    public edit(project: Project) {
        const pxe = project.context.pathExpressionEngine;

        verifyElmProject(project);

        const program = ElmProgram.parse(project);
        if (program.programLevel !== "static") {
            // nothing to do here, it's already a Program
            return;
        }



        // Copy in the beginner program. We will change it. Then we will copy its body into Main.
        project.copyEditorBackingFileOrFailToDestination("src/BeginnerProgram.elm", "deleteme/BeginnerProgram.elm");
        const beginnerProgram = ElmProgram.parse(project, "deleteme/BeginnerProgram.elm");

        // put the body of the current main into the new view function
        const existingMain = program.getFunction("main");
        beginnerProgram.getFunction("view").body.update(existingMain.body.value());
        beginnerProgram.reparse();


        const fullTypeOfMain : string = existingMain.declaredType.value();

        // the stuff we need from the existing program
        const existingModuleBody = (program.moduleNode as any).moduleBody.value();
        const everythingButMain: string = existingModuleBody.replace(
            existingMain._whole.value(), "").replace(
            new RegExp(fullTypeOfMain, "g"), "Html Msg"
        );
        // TODO: could remove some whitespace too

        // bring the code we need in to the project so we can parse it


        // add the rest of Main.elm to the view section
        const newViewSection = beginnerProgram.getSection("VIEW");
        newViewSection.body.update(
            newViewSection.body.value() + "\n\n" + everythingButMain);
        beginnerProgram.reparse();


        moveTypeAliasesFromViewToModelSection(beginnerProgram);
        beginnerProgram.reparse();


        program.moduleNode.moduleBody.update(beginnerProgram.moduleNode.moduleBody.value())

        // console.log("Here is the file yo");
        // console.log(basicMainTreeNode.value().replace(/^$/mg, "[blank]"));

        project.deleteFile("deleteme/BeginnerProgram.elm");

    }
}

function moveTypeAliasesFromViewToModelSection(p: ElmProgram) {}

/**
 * Throw a useful exception if we're in the wrong place
 */
function verifyElmProject(project: Project): void {
    if (!project.fileExists("elm-package.json")) {
        throw new Error("I don't see elm-package.json. Are you at the root of an Elm project?");
    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
