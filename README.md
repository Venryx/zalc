# Zalc

A wrapper around yalc that adds some additional features.

## Problem

TODO

## Proposed solutions

Base: manual copying (tedious, error-prone)

### NPM link (and such)

`npm link ...`
* Links are lost on `npm install`.

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
1) If you have a dependency [A] that is yalc-including a further subdependency [B], and you want that subdependency's latest code to be seen in the root project, you need to either include the `.yalc` folder in the `files` field of dep A (which adds bloat to npm publishes -- though it's what I currently use for personal packages), hack the yalc code to include the `.yalc` folder for dep A when running `yalc public/push` (may automate this as part of zalc in the future), or use an absolute-path `link:` entry for A's subdependencies (which will annoy other developers as they have to exactly match the layout of those subdependency source-folders on their computers; also, since it uses `link:`, it causes the root `yarn.lock` to be incomplete, which has the drawbacks listed earlier).

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

## Improvement

Zalc intends to improve upon the best solution above (`yalc add ... --pure` + adding `.yalc/*` to `workspaces`), by wrapping the yalc tool, to automate some steps and extend Yalc's functionality.

Besides attempting to resolve or workaround the major drawbacks seen in the listing above, there are some other smaller improvements that Zalc will provide:
1) Automate the step of adding the line that includes the `.yalc` folders as workspace folders.
2) Showing a warning message if you've forgotten to npm-publish a library that you've made changes to.
3) Adding a `push-auto` command, which runs `push` whenever the package's files change.
4) Adding a `--deep` flag to the `push`/`push-auto` commands, which traverses up the dependency tree until it reaches the "root projects". (If yalc is used not only in the root project to include a dependency, but also in that dependency to include a subdependency, then whenever you change the subdependency, you have to run `yalc push` twice: once in subdep, and once in dep. The `--deep` flag will make this unnecessary.)

Remaining drawbacks:
* As of now, Yalc's first drawback (if yalc is at multiple levels, each middle-level needs to include the subdeps in its npm-publish for local subdep changes to be visible in the root project) still applies to zalc as well.