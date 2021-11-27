# Zalc

A wrapper around [yalc](https://github.com/wclr/yalc) that adds some additional features.

## Problem

TODO

## Proposed solutions

Base: manual copying (tedious, error-prone)

### NPM link (and such)

`npm link ...`
* Links are lost on `npm install`. (you can use a tool like [npm-safe-install](https://github.com/UD-UD/npm-safe-install) to help with this, but it has its own issues -- such as slowing down package installs, and breaking some file-watcher tooling [eg. vscode's typescript typings can get messed up in some cases, requiring an IDE restart])

`npm install file:...`
* TODO

### Yarn link (and such)

Using `file:`, `link:`, or `portal:` protocols:
* Links cannot be customized per user. (this point can be fixed using [yarn-vtools-plugin](https://github.com/Venryx/yarn-vtools))
* For `file`: TODO
* For `link`: Links do not follow subdependencies, meaning `yarn.lock` is incomplete. (likely to cause subtle CI/docker build issues down the road)
* For `portal`: Portals can only point to folders within the repo root, meaning you still need a tool that gathers the dependency files appropriately.

> One idea to avoid the drawback of `link:` entries (of `yarn.lock` becoming incomplete) could be to combine each `link:` entry with a `portal:` entry, to a hollow fake-package (inserted into `.yalc` or something) containing nothing but an identical list of subdependencies; the `link:` entry thus includes the library's own code, while the "fake" `portal:` entry includes the library's subdependencies. Haven't tested this yet, however. 

Using auto-found workspaces:
* Workspaces are still portals under-the-hood, so have the same issue listed above. (can only point to folders within the repo root)

### Git submodules
* TODO

### File-sync tools

General:
* Syncing is not instant, or doesn't notify file-watchers, or does unnecessary rewrites.

Customizable tools: (eg. file-syncer)
* The customization needs to be repeated in each root project. (and while you could enhance them to read composable configs within each dependency, the work is substantial and would justify a specialized tool)

### NPM-pack-here
* TODO

### Yalc

General:
1) If you have a dependency [A] that is yalc-including a further subdependency [B], and you want that subdependency's latest code to be seen in the root project, you need to either:
* Include the `.yalc` folder in the `files` field of dep A. (which adds bloat to npm publishes)
* Hack the yalc code to include the `.yalc` folder for dep A when running `yalc public/push`. (this is planned to be automated by zalc; see "Improvements" section)
* Use an absolute-path `link:` entry for A's subdependencies. (which will annoy other developers as they have to exactly match the layout of those subdependency source-folders on their computers; also, since it uses `link:`, it causes the root `yarn.lock` to be incomplete, which has the drawbacks listed earlier)

`yalc add ...`
* TODO

`yalc add ... --link`
* Links do not follow subdependencies, meaning `yarn.lock` is incomplete. (likely to cause subtle CI/docker build issues down the road)

`yalc link ...`
* TODO

`yalc add ... --pure`
* TODO

`yalc add ... --pure` + adding `.yalc/*` to `workspaces`

This is the best solution I've found from pre-existing software. It still has some rough points, however, which are outlined below.

## Improvements

Zalc improves upon the best solution above (`yalc add ... --pure` + adding `.yalc/*` to `workspaces`), by wrapping the yalc tool -- automating some steps and extending Yalc's functionality.

Besides avoiding the problems already listed above, there are some other improvements that Zalc aims to provide: (added features have a ✔️, while planned features have a ⚙️)
1) ✔️ Allow `yalc push` to include folders excluded from the package.json's files-field/npm-publishes (as mentioned under Yalc's first drawback).

	This is particularly useful for allowing "nested" yalc-inclusions: If the root project yalc-includes dep A, and dep A yalc-includes subdep B, this change allows dep A to say "include my `.yalc` folder when I run `yalc push`, so my parent can receive local changes to subdep B through me".

	Note that for this subdep-supplying to work throughout the root project's codebase, you need to either:
	* Add dep A's `.yalc/*` folders to the root project's workspaces folder. [not yet tested]
	* Add aliases/path-resolutions to the relevant tools. (webpack, typescript, etc.)
	* Have the root project use the "inside out" subdependency import pattern. [to be explained later]
2) ⚙️ Add a `--watch` flag to `push`, which reruns the push whenever the package's files change.
3) ⚙️ Possibly: Automate the step of adding the line that includes the `.yalc` folders as workspace folders.
4) ⚙️ Possibly: Show a warning message if you've forgotten to npm-publish a library that you've made changes to.
5) ⚙️ Possibly: Add a `--deep` flag to `push`, which traverses up the dependency tree until it reaches the "root project(s)". (If yalc is used not only in the root project to include a dependency, but also in that dependency to include a subdependency, then whenever you change the subdependency, you have to run `yalc push` twice: once in subdep, and once in dep. The `--deep` flag will make this unnecessary.)

## Usage

1) Install yalc: `npm install -g yalc`
2) Install zalc: `npm install -g zalc`
3) Replace `yalc` with `zalc` for any yalc command where you want the `zalc` modifications to apply.

Additional:
* Add `.yalc` and `yalk.lock` to the `.gitignore` file of each repo where you call `yalc add`. (This is assuming you want your local library changes to stay local to your computer.)

Remember that zalc is just a wrapper for yalc (setting up monkey-patches/call-interceptions prior to yalc's execution), so -- generally speaking -- you can update or modify yalc without zalc breaking. It also means that there are lots of features of yalc that zalc just leaves "as is"; for information on these "other commands and functionality", you can reference the general [yalc documentation here](https://github.com/wclr/yalc).

## General Yalc tips

* Remember that after running `yalc add XXX --pure` (and adding `.yalc/*` to `workspaces`), you still need to run `yarn` for the `node_modules/XXX -> .yalc/XXX` symlink to be created.

## Pattern: Nested yalc-inclusions

TODO