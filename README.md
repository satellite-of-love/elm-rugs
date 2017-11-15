# Deprecated

If you saw [my elm-conf talk](https://www.youtube.com/watch?v=jJ4e6cIBgYM) and were intrigued by using code to edit code:
well you can, but my specific examples don't work anymore.

Instead of Rug, Atomist has [code editors](https://github.com/atomist/automation-client-ts/blob/master/docs/ProjectEditors.md)
as commands inside automation clients. They're in TypeScript, a full programming languages instead of a Rug DSL.
They run on your infrastructure, and interface with Atomist through an API that lets you define Slack commands to trigger
them, query data about commits etc, and react to events like a push or an update.

The bad news is, my parsers were in Scala, and the new version doesn't run in the JVM, so it isn't compatible with the
stuff I wrote these programs for.

So while code to modify code moves on, this particular Elm implementation is defunct.


# Elm with Rug

Elm is a fabulous language. One of my favorite features is its explicitness: everything is perfectly clear and organized. 
Sometimes this leads to one conceptual change requiring changes in many places -- for instance, adding a text input
means adding a model field (change the Model type and init), a message (change the Msg type and update), and the view.

I can abstract this into one operation by writing a program to do the changes for me.

This is where Rug comes in. Rug is an open-source tool developed by Atomist to facilitate _code that modifies code_. 
I write my programs in TypeScript with Rug libraries, then execute them in a Rug runtime. Locally, I use the Rug command line.
Then if I want, I can invite the Atomist bot to my slack team, and it'll create repositories and pull requests for me
using my programs.

## Evolving Elm programs

My primary objective right now is to experiment with Elm programs: start with a simple static page, evolve it into a
BeginnerProgram and then an AdvancedProgram when I need it. Meanwhile I can do should-be-simple tasks like adding an
input field or subscribing to click events as a single operation: run a Rug program that makes a commit with all the 
necessary changes nicely coordinated.

This repository contains Rug programs that you can use on your (simple, for now) Elm programs.

## Try it out

... yeah this won't work

## Start a new Elm project

You could make a directory and run `elm make` and poof you have an Elm project ... but I like a little more organization
than that. Try this:

`rug generate jessitron:elm-rugs:StaticPage happy-new-project-name -R`

This used to create a new directory called happy-new-project-name and put an Elm project in it, with Main.elm inside `src` and 
an index.html inside `resources` and a `build` script that puts all the output inside `target`. 
The `-R` part says "also initialize a git repository and make the initial commit."
Basically it makes a copy of 
this repository, then makes a few adjustments.

(It's cooler when I do this from Slack and it makes the GitHub repo for me and sets up notifications in a matching Slack channel.)

Compile and open the Elm page:

`cd happy-new-project-name`
`./build`
`open target/index.html`

It's blank. Change `src/Main.elm` and repeat. This is when I create the outline of the page, so that I can see what it 
looks like before adding interactivity.

(suggestions for better dev-process scripts welcome)

## Upgrade it to a beginner program

When the static page looks fine and it's time to add interactivity, then from the root of my happy project:

`rug edit jessitron:elm-rugs:UpgradeToBeginnerProgram -R`

Then it would run the UpgradeToBeginnerProgram editor, which changed the code in `src/Main.elm`.
It takes the body of `main` and moves it to `view`, then adds all the other code needed for a beginner program.
You can check out the code for it [here](https://github.com/satellite-of-love/elm-rugs/blob/master/.atomist/editors/UpgradeToBeginnerProgram.ts).

## Sorry it doesn't work anymore.

I'd love to write these again but have other priorities. If you want to, I'm happy to help! [slack](https://join.atomist.com)
