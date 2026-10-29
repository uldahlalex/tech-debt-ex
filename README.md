
The app **works**, but the team built it in a hurry. Every new feature now takes longer than the last one,
and every change breaks something unexpected. Your job is **not** to add features. Your job is to make the
code easier and safer to change, *without changing what the app does*.

We care a lot about two things in this team:

- **Single source of truth.** Every fact (a setting, a rule, a type, a list of allowed values) is written down
  in exactly one place. Everything else reads it from there.
- **Type safety.** If something is wrong, the compiler should tell us before a user does. No `any`,
  no `@ts-ignore`, no `object`/`dynamic`/`Dictionary<string, object>` where a real type could be.

To run the playwright tests (with browser installation)

```bash
cd e2e && bun install && bun run install-browser && bun run test
```

Everything should be green. **Keep it green.** Run the tests after every small step and commit every time they
pass. 

In Moodle the agenda includes a "wrap-up" where we meet and talk about change proposals.