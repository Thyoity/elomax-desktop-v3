# Project guidelines for Claude

## Comments

Default: **don't write comments**. The code, its identifiers, and the commit
message tell the story. Only add a comment when **all** of these are true:
- The "what" is already clear from the code.
- The "why" is genuinely non-obvious (a hidden constraint, a subtle
  invariant, a workaround for a specific upstream bug).
- Removing the comment would actually confuse a future reader.

Specifically banned:
- Explaining what the code does ("this loops over the items").
- Restating the function signature in prose.
- Narrating the migration history ("we used to do X, now we do Y").
- Multi-paragraph rationale; PR description / commit message belongs there.
- Block comments above each `if`/`for`/method describing the logic.

If a non-obvious "why" really needs documenting, write **one short line**.

## Scripts

`scripts/` is for files the project depends on at runtime, install, or release
(anything referenced by `package.json`, CI, or documented workflows). Treat it
as code that must stay in the repo.

One-shot helpers — codemods, batch renamers, ad-hoc migrations — go in
`scripts/oneshot/`, which is gitignored. They never enter a commit by accident
and can be deleted with `rm -rf scripts/oneshot/`. If a one-shot turns out to be
worth keeping, promote it to `scripts/` in an explicit commit.

Before deleting anything in `scripts/`, check `package.json` to confirm nothing
references it.
