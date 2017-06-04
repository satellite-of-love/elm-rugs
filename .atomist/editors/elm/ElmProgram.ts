import { Project } from "@atomist/rug/model/Project";
import { PathExpressionEngine, TextTreeNode } from "@atomist/rug/tree/PathExpression";

interface Field {
    name: string;
    type: string;
}

export class ElmProgram {

    public static parse(project: Project, filepath: string = "src/Main.elm"): ElmProgram {
        if (!project.fileExists(filepath)) {
            throw new Error("File not found: " + filepath);
        }
        const pxe = project.context.pathExpressionEngine;
        const topLevelNode =
            pxe.scalar<Project, TextTreeNode>(
                project,
                `/${filepath}/Elm()`);
        return new ElmProgram(pxe, topLevelNode);
    }
    private constructor(private pxe: PathExpressionEngine, private moduleNode: TextTreeNode) {

    }

    private descend(pe: string): any {
        return this.pxe.scalar<TextTreeNode, TextTreeNode>(this.moduleNode, pe);
    }

    /*
  | ├─┬ [84-122] typeAlias
  | | ├── [96-101] typeName is Model
  | | └─┬ [108-122] definition
  | |   └─┬ [108-122] recordType
  | |     └─┬ [110-120] recordTypeField
  | |       ├── [110-115] fieldName is count
  | |       └─┬ [117-120] fieldType
  | |         └─┬ [117-120] typeReference
  | |           └─┬ [117-120] typeName
  | |             └── [117-120] component is Int
     */
    get modelFields(): Field[] {
        const modelType =
            this.descend("//typeAlias[@typeName='Model']").definition.recordType;
        if (modelType.recordTypeField === undefined) {
            // 0
            return [];
        } else if (modelType.recordTypeField instanceof Array) {
            // more than one
        } else {
            // 1
            return [{
                name: modelType.recordTypeField.fieldName.value(),
                type: modelType.recordTypeField.fieldType.value(),
            }];
        }
    }

}
