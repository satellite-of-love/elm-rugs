import { TextTreeNode } from "@atomist/rug/tree/PathExpression";

function printNode(a: TextTreeNode): string {
    if (a.children().length === 0) {
        return `${a.nodeName()} = ${a.value()}`;
    } else {
        return a.nodeName();
    }
}

export function drawTree(baby: TextTreeNode): string {
    return draw<TextTreeNode>((a) => a.children(), printNode, baby);
}

/**
 * TreeNodePrinter utility.
 * It lets you draw a cute tree like
 *

 Grandma
 ├─┬ Dad
 | ├── Sister
 | └─┬ Me
 |   ├── Daughter
 |   └── Son
 └── Aunt

 *
 * To use it, pass two functions:
 * @param children how to access child nodes
 * @param info how to print a node
 * @param topOfTree and then the top-level node!
 *
 * @return String. Print it yourself
 */
export function draw<T>(children: (T) => T[], info: (T) => string, topOfTree: T): string {

    function drawInternal(tn: T): string[] {
        if (children(tn).length === 0) {
            return [info(tn)];
        }
        else {
            return [info(tn)].concat(printChildren(children(tn)));
        }
    }

    function printChildren(ch: T[]): string[] {
        console.log(ch.toString());
        const last = ch[ch.length - 1];
        const notLast = ch.slice(0, ch.length - 1);

        const lastLine = prefixChildLines(children(last).length > 0, true, drawInternal(last));
        const earlierLines = [].concat.apply([], notLast.map((tn) => prefixChildLines(children(tn).length > 0, false, drawInternal(tn))));

        return earlierLines.concat(lastLine);
    }

    return drawInternal(topOfTree).join("\n");
}
// this won't be pretty on Windows
const LAST_TREE_NODE = "└── ";
const LAST_TREE_NODE_WITH_CHILDREN = "└─┬ ";
const TREE_NODE = "├── ";
const TREE_NODE_WITH_CHILDREN = "├─┬ ";
const TREE_CONNECTOR = "| ";
const FILLER = "  ";

function prefixChildLines(hasChildren: boolean, last: boolean, childLines: string[]): string[] {

    const head = childLines[0];
    const rest = childLines.slice(1);

    const connector = last ? FILLER : TREE_CONNECTOR;
    const firstLine = firstLineOfChildPrefix(hasChildren, last) + head;
    const restLines = rest.map((a) => connector.concat(a));
    return [firstLine].concat(restLines);

}

function firstLineOfChildPrefix(hasChildren: boolean, last: boolean): string {
    return (hasChildren && last) ? LAST_TREE_NODE_WITH_CHILDREN :
        ((hasChildren && !last) ? TREE_NODE_WITH_CHILDREN :
            ((!hasChildren && last) ? LAST_TREE_NODE :
                ((!hasChildren && !last) ? TREE_NODE :
                    "the impossible has happened")));
}
