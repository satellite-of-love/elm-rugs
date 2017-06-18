import {Project} from "@atomist/rug/model/Project";
import {PathExpressionEngine, TextTreeNode} from "@atomist/rug/tree/PathExpression";
import * as TreePrinter from "../../editors/TreePrinter";
import * as _ from "lodash";

interface Field {
    name: string;
    type: string;
    initialization: string;
}

interface ReactionToMessage {
    deconstructor: TextTreeNode;
    body: TextTreeNode;
}

export interface Message {
    name: TextTreeNode;
    constructor: TextTreeNode;
    reactions: ReactionToMessage[];
}

export class ElmProgram {

    public static parse(project: Project, filepath: string = "src/Main.elm"): ElmProgram {
        if (!project.fileExists(filepath)) {
            throw new Error("File not found: " + filepath);
        }
        return new ElmProgram(project, filepath);
    }

    private pxe: PathExpressionEngine;
    private reparse: () => void;
    private moduleNode: TextTreeNode;

    private constructor(project: Project, filepath: string) {
        this.pxe = project.context.pathExpressionEngine;
        this.reparse = () => {
            this.moduleNode =
                this.pxe.scalar<Project, TextTreeNode>(
                    project,
                    `/${filepath}/Elm()`);
        };
        this.reparse();

    }

    /*
     |   ├── [138-142] functionName is init
     |   └─┬ [149-162] body
     |     └─┬ [149-162] functionApplication
     |       └─┬ [149-162] function
     |         └─┬ [149-162] recordLiteral
     |           └─┬ [151-160] recordLiteralField
     |             ├── [151-156] fieldName is count
     |             └─┬ [159-160] fieldValue
     |               └─┬ [159-160] functionApplication
     |                 └─┬ [159-160] functiois 0
     |                   └── [159-160] intLiteral is 0
     */
    get modelFields(): Field[] {

        const nodeToField = (n, v) => {
            return {
                name: n.fieldName.value(),
                type: n.fieldType.value(),
                initialization: v.fieldValue.value(),
            };
        };
        const types = this.descend(
            "//typeAlias[@typeName='Model']/definition/recordType/recordTypeField");
        const values = this.descend(
            "//functionDeclaration[@functionName='init']//recordLiteralField");

        if (values.length !== types.length) {
            console.log(TreePrinter.drawTree(this.moduleNode));
            throw new Error("Could not detect initial values and types of model fields");
        }

        let i = 0; // the two-arg map is broken
        const fields =
            types.map((e) => nodeToField(e, values[i++]));
        return fields;
    }

    public addModelField(name: string, type: string, value: string): void {
        {
            const newFieldType = `${name} : ${type}`;
            const fields = this.descend("//typeAlias[@typeName='Model']/definition/recordType/recordTypeField");
            if (fields.length === 0) {
                const emptyModel = this.descend("//typeAlias[@typeName='Model']/definition/recordType");
                if (emptyModel.length !== 1) {
                    throw new Error("Can't find the model at all");
                }
                emptyModel[0].update("{ " + newFieldType + " } ");
            } else {
                const last = fields[fields.length - 1];
                last.update(last.value() + ", " + newFieldType);
            }
        }
        this.reparse();
        {
            const newFieldValue = `${name} = ${value}`;
            const values = this.descend(
                "//functionDeclaration[@functionName='init']//recordLiteralField");
            if (values.length === 0) {
                const empty = this.descend(
                    "//functionDeclaration[@functionName='init']//recordLiteral");
                empty[0].update("{ " + newFieldValue + " }");
            } else {
                const last = values[values.length - 1];
                last.update(last.value() + ", " + newFieldValue);
            }
        }
    }


    get updateClauses(): ReactionToMessage[] {
        const reactions = this.descend(
            "//functionDeclaration[@functionName='update']/body//caseExpression[/pivot[@value='msg']]/clause");
        const messageReactions = reactions.map((clause: any) => {

                // console.log(TreePrinter.drawTree(clause));
                if (clause.pattern.deconstructor &&
                    clause.pattern.deconstructor.constructorName) {
                    return {
                        name: clause.pattern.deconstructor.constructorName,
                        deconstructor: clause.pattern,
                        body: clause.result
                    }
                } else if (clause.pattern.constructorName) {
                    return {
                        name: clause.pattern.constructorName,
                        deconstructor: clause.pattern,
                        body: clause.result
                    }
                } else {
                    throw new Error("Unable to find name for " + clause.value())
                }
            }
        );
        return messageReactions;
    }

    /*
     *
     */
    get messages(): Message[] {

        const messageReactions = this.updateClauses;
        const reactionsMap = _.groupBy(messageReactions, (r) => r.name.value());

        /*
         | ├── [210-218] sectionHeader is MESSAGES
         | └─┬ [221-241] unionTypeDeclaration
         |   ├── [227-230] typeName is Msg
         |   └─┬ [237-241] constructor
         |     └─┬ [237-241] typeReference
         |       └─┬ [237-241] typeName
         |         └── [237-241] component is NoOp
         */
        const values = this.descend(
            "//unionTypeDeclaration[@typeName='Msg']//constructor");
        const messages = values.map((ttn: any) => {
            const name = ttn.typeReference.typeName.value();
            return {
                constructor: ttn,
                name: ttn.typeReference.typeName,
                reactions: reactionsMap[name],
            };
        });

        return messages;
    }

    public addMessage(params: {constructor: string, deconstructor: string}) {
        const lastMessage = last(this.messages, "messages");

        lastMessage.constructor.update(lastMessage.constructor.value() + `
    | ${params.constructor}`);

        this.reparse();

        const lastReaction = last(this.updateClauses, "update clauses");

        // @rod this should check the indention, match what's on lastReaction.pattern. We have that functionality, how to use it?
        lastReaction.body.update(lastReaction.body.value() + `
        
        ${params.deconstructor} -> 
            model`)
        // TODO: handle advanced program
    }

    private descend(pe: string): TextTreeNode[] {
        return this.pxe.evaluate<TextTreeNode, TextTreeNode>(this.moduleNode, pe).matches;
    }

}

function last<T>(arr: T[], name: string = "an"): T {
    if (arr.length === 0) {
       throw new Error(`${name} array was empty`)
    }
    return arr[arr.length - 1];
}
