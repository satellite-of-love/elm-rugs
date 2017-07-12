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

        const basicMainTreeNode = pxe.scalar<Project, TextTreeNode>(project, "/src/Main.elm/Elm()");
        const program = ElmProgram.parse(project);

        const fullTypeOfMain : any = program.getFunction("main").declaredType;
        if (fullTypeOfMain.typeReference.typeName.value() === "Program") {
            // nothing to do here, it's already a Program
            return;
        }

        function descend(from: TextTreeNode, path: string): TextTreeNode {
            try {
                return pxe.scalar<TextTreeNode, TextTreeNode>(from, path);
            } catch (e) {
                console.log("the children are: " + from.children().map((n) => n.nodeName() + (n as any).sectionHeader.value()).join(","));
                throw e;
            }
        }


        // the stuff we need from the existing program
        const existingModuleBody = descend(basicMainTreeNode, "/moduleBody");
        const existingMain = program.getFunction("main");
        const everythingButMain: string = existingModuleBody.value().replace(existingMain.whole.value(), "");
        // TODO: could remove some whitespace too

        // bring the code we need in to the project so we can parse it
        project.copyEditorBackingFileOrFailToDestination("src/BeginnerProgram.elm", "deleteme/BeginnerProgram.elm");

        // TODO: imports.

        const mainBodyText = existingMain.body.value();
        // update the view function to contain the body of Main.main

        const beginnerProgram = ElmProgram.parse(project, "deleteme/BeginnerProgram.elm");
        beginnerProgram.getFunction("view").body.update(mainBodyText);
        beginnerProgram.reparse();

        // add the rest of Main.elm to the view section
        const newViewSection = beginnerProgram.getSection("VIEW");
        newViewSection.body.update(
            newViewSection.body.value() + "\n\n" + everythingButMain);

        pxe.with<TextTreeNode>(project,
            "/deleteme/BeginnerProgram.elm/Elm()/moduleBody",
            (beginnerProgramBody) => {
                // anything that used to return Html Never or whatever the original
                // main was returning, now that should return Html Msg.
                const adjustedBeginnerProgramBody =
                    beginnerProgramBody.value().
                        replace(new RegExp(fullTypeOfMain.value(), "g"), "Html Msg");
                existingModuleBody.update(adjustedBeginnerProgramBody);
            },
        );

        // console.log("Here is the file yo");
        // console.log(basicMainTreeNode.value().replace(/^$/mg, "[blank]"));

        project.deleteFile("deleteme/BeginnerProgram.elm");

    }
}

/**
 * Throw a useful exception if we're in the wrong place
 */
function verifyElmProject(project: Project): void {
    if (!project.fileExists("elm-package.json")) {
        throw new Error("I don't see elm-package.json. Are you at the root of an Elm project?");
    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
