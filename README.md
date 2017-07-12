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

You'll need the Rug CLI. On a Mac:
```
$ brew tap atomist/tap
$ brew install rug-cli
```
elsewhere: http://docs.atomist.com/user-guide/interfaces/cli/install/
This gets you a program called `rug`.

Then clone this repo (I'll work on removing this step, but for now...) and run `rug install` in its directory.
If this doesn't work please open an issue! I want to fix it!
This publishes the Rugs to a local repository on your computer, so that the Rug CLI can find them from anywhere.

## Start a new Elm project

You could make a directory and run `elm make` and poof you have an Elm project ... but I like a little more organization
than that. Try this:

`rug generate jessitron:elm-rugs:StaticPage happy-new-project-name -R`

This'll create a new directory called happy-new-project-name and put an Elm project in it, with Main.elm inside `src` and 
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

Now Rug will run the UpgradeToBeginnerProgram editor, which changes the code in `src/Main.elm`.
It takes the body of `main` and moves it to `view`, then adds all the other code needed for a beginner program.
You can check out the code for it [here](https://github.com/satellite-of-love/elm-rugs/blob/master/.atomist/editors/UpgradeToBeginnerProgram.ts).

Have fun changing update and adding stuff to Model and Msg.... I'll add information about editors that can help with that here.

