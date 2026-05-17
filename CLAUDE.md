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
