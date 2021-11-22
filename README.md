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

`yalc add ... --pure` + manual inclusion of `.yalc` folder to `workspaces`

This is the best solution I've found from pre-existing software.

However, this still requires some manual work that would be nice to automate away:
1) Adding the line that includes the `.yalc` folders as workspace folders.
2) Warning you when you have not npm-published a library that you've made changes to.
3) etc.

With these changes, this appears the best overall solution to me. That said, it still has the drawbacks listed in Yalc's "General" section. (the main problem being the first one)