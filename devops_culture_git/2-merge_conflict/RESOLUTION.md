## 2. Merge conflicts, no sweat

### What was in conflict

Two branches modified `config.yml`:

- `feature/scale-up` set `version: 1.1.0` (and bumped `replicas` to 4).
- `feature/dark-mode` set `version: 2.0.0` (and added `feature_dark_mode: true`).

When merging `feature/dark-mode` into `feature/scale-up`, Git raised a conflict on a single line: `version`. That was the only line marked with `<<<<<<<`, `=======` and `>>>>>>>` in the file.

### Why only that line, and not the others

`replicas: 4` and `feature_dark_mode: true` were merged automatically by Git, with no conflict markers at all. That happened because each branch touched a different line of the file: `feature/scale-up` only changed `replicas`, `feature/dark-mode` only changed `feature_dark_mode`. Git's three-way merge can combine changes on different lines without any ambiguity — it simply keeps both edits.

`version`, on the other hand, was changed by both branches, to two different values (`1.1.0` vs `2.0.0`). Git has no way to know which value is "correct" when the exact same line diverges on both sides, so it stops and asks a human to decide. This is the core lesson: a merge conflict only happens when both branches edit the same line differently — not just the same file.

### The choice made

The conflict was resolved by keeping `version: 2.0.0`, as required, while preserving the other changes that had already merged cleanly:

- `replicas: 4` (from `feature/scale-up`)
- `feature_dark_mode: true` (from `feature/dark-mode`)

No feature was dropped: both changes are present in the final file, and the version number reflects the more significant change (the dark mode feature bump to `2.0.0`).

### Why small, focused changes reduce merge conflicts

This exercise shows directly why keeping commits and branches small and focused matters: `feature/scale-up` and `feature/dark-mode` each touched a different, single line of the config, so Git merged them without any help. The only friction came from the one line both branches happened to touch: `version`. The more lines (or files) a branch changes, the higher the chance it overlaps with someone else's work in progress, and the more conflicts pile up to resolve by hand. Small, targeted changes shrink that overlap surface, keep merges mostly automatic, and make the conflicts that do happen easy to reason about — like this one.
