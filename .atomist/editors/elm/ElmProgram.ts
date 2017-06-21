import {Project, File} from "@atomist/rug/model/Core";
import {PathExpressionEngine, TextTreeNode} from "@atomist/rug/tree/PathExpression";
import * as TreePrinter from "../../editors/TreePrinter";
import * as _ from "lodash";

interface Field {
    name: string;
    type: TextTreeNode;
    initialization: TextTreeNode;
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

export interface Function {
    name: string, // make this a class in order to set it; there can be 2
    // parameters?
    declaredType: TextTreeNode,
    body: TextTreeNode,
}

export interface Section {
    name: TextTreeNode,
    body: TextTreeNode
}

export type ProgramLevel = "static" | "beginner" | "advanced"

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

    private constructor(project: Project, private filepath: string) {
        this.pxe = project.context.pathExpressionEngine;
        this.reparse = () => {
            trailingNewline(project.findFile(filepath));
            this.moduleNode =
                this.pxe.scalar<Project, TextTreeNode>(
                    project,
                    `/${filepath}/Elm()`);
        };
        this.reparse();

    }


    get programLevel(): ProgramLevel {
        const mainFunction = this.getFunction("main");
        if (mainFunction == null) {
            throw new Error(`Unable to analyse ${this.filepath}. No main function found`)
        }

        const mainType = (mainFunction.declaredType as any).typeReference.typeName.value();

        if (mainType === "Html") {
            return "static";
        } else if (mainType === "Program") {
            const mainBody = mainFunction.body.value();
            return (mainBody.indexOf("beginnerProgram") >= 0) ?
                "beginner" :
                "advanced"
        } else {
            throw new Error("Unhandled type of main: " + mainType);
        }
    }

    public upgrade() {
        if (this.programLevel === "advanced") {
            return;
        }
        if (this.programLevel !== "beginner") {
            throw new Error("Can only upgrade a beginner program to advanced")
        }

        const main = this.descend(`//functionDeclaration[@functionName='main']`)[0];
        main.update(ADVANCED_MAIN);
        this.reparse();

        const init = this.getFunction("init");
        init.declaredType.update("( Model, Cmd Msg )");
        init.body.update(`( ${init.body.value()}, Cmd.none )`);
        this.reparse();

        const update = this.getFunction("update");
        update.declaredType.update("Msg -> Model -> ( Model, Cmd Msg )")
        this.reparse();

        const reactions = this.updateClauses;
        reactions.forEach(r =>
            r.body.update(`( ${r.body.value()}, Cmd.none )`)
        );
        this.reparse();

        const updateSection = this.getSection("UPDATE");
        updateSection.body.update(updateSection.body.value() + "\n\n\n\n" + SUBSCRIPTIONS_SECTION);
        this.reparse();
    }

    public getFunction(name: string): Function | null {
        const functionNodes = this.descend(`//functionDeclaration[@functionName='${name}']`);
        if (functionNodes.length === 0) {
            return null;
        }
        if (functionNodes.length > 1) {
            throw new Error(`WTF there are ${functionNodes.length} functions named ${name}`)
        }

        const functionNode: any = functionNodes[0];

        const declaredType =
            functionNode.typeDeclaration &&
            functionNode.typeDeclaration.declaredType
            || null;

        return {
            name,
            declaredType,
            body: functionNode.body
        }
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

        const nodeToField = (n: { fieldName: TextTreeNode, fieldType: TextTreeNode }, v: { fieldValue: TextTreeNode }): Field => {
            return {
                name: n.fieldName.value(),
                type: n.fieldType,
                initialization: v.fieldValue,
            };
        };
        const types = this.descend(
            "//typeAlias[@typeName='Model']/definition/recordType/recordTypeField");
        const recordLiterals = this.descend(
            "//functionDeclaration[@functionName='init']//recordLiteral");
        if (recordLiterals.length === 0) {
            throw new Error("No record literal found in init")
        }
        // find the biggest one. There could be some inside. Will the biggest one always be first? probably
        const initialModel: any = recordLiterals[0];


        const values = toArray(initialModel.recordLiteralField);

        if (values.length !== types.length) {
            console.log(TreePrinter.drawTree(this.moduleNode));
            console.log(`There are ${values.length} Values: ` + JSON.stringify(values));
            console.log(`There are ${types.length} Types: ${JSON.stringify(types)}`);
            throw new Error("Could not detect initial values and types of model fields");
        }

        let i = 0; // the two-arg map is broken
        const fields =
            types.map((e) => nodeToField(e as any, values[i++] as any));
        return fields;
    }

    public addModelField(name: string, type: string, value: string): void {

        const before = this.modelFields
        if (before.length === 0) {
            {
                const newFieldType = `${name} : ${type}`;
                const emptyModel = this.descend("//typeAlias[@typeName='Model']/definition/recordType");
                if (emptyModel.length < 1) {
                    console.log(TreePrinter.drawTree(this.moduleNode));
                    throw new Error("Can't find the model at all");
                }
                emptyModel[0].update("{ " + newFieldType + " }");
            }
            this.reparse();
            {
                const newFieldValue = `${name} = ${value}`;
                const empty = this.descend(
                    "//functionDeclaration[@functionName='init']//recordLiteral");
                empty[0].update("{ " + newFieldValue + " }");
            }
            this.reparse();
        }
        else {
            {
                const fields = this.modelFields;

                const newFieldType = `${name} : ${type}`;
                const lastType = fields[fields.length - 1].type;
                lastType.update(lastType.value() + ", " + newFieldType);

                const newFieldValue = `${name} = ${value}`;
                const last = fields[fields.length - 1].initialization;
                last.update(last.value() + ", " + newFieldValue);
            }
            this.reparse();
        }
    }


    get updateClauses(): ReactionToMessage[] {
        const reactions = this.descend(
            "//functionDeclaration[@functionName='update']/body//caseExpression[/pivot[@value='msg']]/clause");
        const messageReactions = reactions.map((clause: any) => {

                //console.log("A clause:" + drawTree(clause));

                // not sure why we get two constructorNames for `Click Nothing`
                if (clause.pattern.deconstructor &&
                    clause.pattern.deconstructor.constructorName &&
                    Array.isArray(clause.pattern.deconstructor.constructorName)) {
                    return {
                        name: clause.pattern.deconstructor.constructorName[0],
                        deconstructor: clause.pattern,
                        body: clause.result
                    }
                } else if (clause.pattern.deconstructor &&
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
            // console.log("a value:\n" + drawTree(ttn));
            const name = ttn.typeReference.typeName.value();
            return {
                constructor: ttn,
                name: ttn.typeReference.typeName,
                reactions: reactionsMap[name],
            };
        });

        return messages;
    }

    public addMessage(params: {
        constructor: string,
        deconstructor?: string,
        updatedModel?: string
    }) {
        const defaultReaction =
            this.programLevel === "beginner" ?
                "model" :
                "( model, Cmd.none )";
        const deconstructor = params.deconstructor || params.constructor;
        const updatedModel = params.updatedModel || defaultReaction;
        const reaction = this.programLevel === "beginner" ?
            updatedModel :
            `( ${updatedModel}, Cmd.none )`;

        const lastMessage = last(this.messages, "messages");

        lastMessage.constructor.update(lastMessage.constructor.value() + `
    | ${params.constructor}`);

        this.reparse();

        const lastReaction = last(this.updateClauses, "update clauses");

        // @rod this should check the indention, match what's on lastReaction.pattern. We have that functionality, how to use it?
        lastReaction.body.update(lastReaction.body.value() + `

        ${deconstructor} ->
            ${reaction}`);

        this.reparse();
    }

    public addSubscription(subscription: string) {
        const subscriptionsFunction = this.getFunction("subscriptions");
        if (subscriptionsFunction == null) {
            throw new Error("Didn't find the subscriptions function");
        }

        if (subscriptionsFunction.body.value() === "Sub.none") {
            subscriptionsFunction.body.update(subscription)
        } else {
            // TODO
            throw new Error("please implement")
        }

        this.reparse();
    }

    /*
     * sections
     */
    private get sections(): Section[] {
        const sectionNodes = this.descend("//section")

        return sectionNodes.map((s: any) => {
                return {
                    name: s.sectionHeader,
                    body: s.sectionContent
                }
            }
        )
    }

    private getSection(sectionName: string): Section {
        const sections = this.sections.filter(s => s.name.value() === sectionName);
        if (sections.length === 0) {
            throw new Error(`Section ${sectionName} not found in ${this.filepath}`)
        }
        return sections[0];
    }

    public addFunction(functionText: string, sectionName: string) {
        const sectionOfInterest = this.getSection(sectionName);

        sectionOfInterest.body.update(
            sectionOfInterest.body.value() + "\n\n\n" + functionText);

        this.reparse();
    }

    /*
     * Imports
     *
     * Returns true if the import was added,
     * false if it was already there
     */
    public addImport(name: string) {
        const newImport = `import ${name}`;

        function importCompare(a: string, b: string): number {
            //  console.log(`comparing ${a} to ${b}`)
            if (b.indexOf(a) === 0) {
                // a is contained within b. put b later
                return -1;
            }
            if (a.indexOf(b) === 0) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            if (b < a) {
                return 1;
            }
            return 0;
        }

        const imports = this.descend("//import");

        if (imports.length === 0) {
            const moduleDeclaration = this.descend("/moduleDeclaration")[0];
            moduleDeclaration.update(moduleDeclaration.value() + "\n\n" + newImport)
        }

        const before = imports.filter((i: any) => importCompare(i.importName.value(), name) < 0);
        const same = imports.filter((i: any) => i.importName.value() === name);
        const after = imports.filter((i: any) => 0 < importCompare(i.importName.value(), name));

        if (same.length > 0) {
            // import already present
            return false;
        }

        if (before.length > 0) {
            // add it after the last earlier one.
            // so if they're alphabetical, they'll stay alphabetical.
            const last = before[before.length - 1];
            last.update(last.value() + "\n" + newImport);
        } else if (after.length > 0) {
            const first = after[0];
            first.update(newImport + "\n" + first.value());
        }

        this.reparse();
        return true;
    }

    private descend(pe: string): TextTreeNode[] {
        return this.pxe.evaluate<TextTreeNode, TextTreeNode>(this.moduleNode, pe).matches;
    }

}

const ADVANCED_MAIN =
    `main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }`;

const SUBSCRIPTIONS_SECTION =
    `-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none`;

function last<T>(arr: T[], name: string = "an"): T {
    if (arr.length === 0) {
        throw new Error(`${name} array was empty`)
    }
    return arr[arr.length - 1];
}

function trailingNewline(f: File) {
    const content = f.content;
    if (!f.content.match(/\n$/)) {
        f.setContent(content + "\n");
    }
}

function toArray(possiblyTreeNodes): TextTreeNode[] {
    return possiblyTreeNodes ?
        (Array.isArray(possiblyTreeNodes) ? possiblyTreeNodes
            : [possiblyTreeNodes])
        : [];
}
