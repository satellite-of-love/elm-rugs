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

        const nodeToField = (n: any) => {
            return {
                name: n.fieldName.value(),
                type: n.fieldType.value(),
            };
        };
        const fields = this.descend("//typeAlias[@typeName='Model']/definition/recordType/recordTypeField");

        return fields.map(nodeToField);
    }

    public addModelField(name: String, type: String, value: String): void {
        const newFieldType = `${name} : ${type}`;
        const fields = this.descend("//typeAlias[@typeName='Model']/definition/recordType/recordTypeField");
        if (fields.length === 0) {
            const emptyModel = this.descend("//typeAlias[@typeName='Model']/definition/recordType");

            emptyModel[0].update("{ " + newFieldType + " } ");
        } else {
            const last = fields[fields.length - 1];
            last.update(last.value() + ", " + newFieldType);
        }
    }

    private descend(pe: string): TextTreeNode[] {
        return this.pxe.evaluate<TextTreeNode, TextTreeNode>(this.moduleNode, pe).matches;
    }

}
