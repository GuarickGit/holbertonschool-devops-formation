## 5. A good commit is a gift to future-you

### Git log

```
0844e60 (HEAD -> main) docs: add README explaining HolbieBot usage
53423ea test: add unit tests for energy validation
b25d565 refactor: extract energy validation into its own function
c8a4e9e fix: clamp energy value between 0 and 100
1b5e6a6 feat: add deploy function to bot
```

### Why each type matches the change

- **`feat: add deploy function to bot`** — this introduced a brand new capability (the `deploy()` function and its call), something the bot could not do before.
- **`fix: clamp energy value between 0 and 100`** — `bot_status` previously accepted impossible energy values (e.g. 150 or -20); this corrected that broken behaviour so energy always stays within a valid range.
- **`refactor: extract energy validation into its own function`** — the validation logic was moved into its own `validate_energy()` function with no change to the program's behaviour, purely improving code organization.
- **`test: add unit tests for energy validation`** — this added unit tests (normal value, below 0, above 100) for existing, already-working code, without changing any behaviour.
- **`docs: add README explaining HolbieBot usage`** — this added documentation (what the bot does, how to run it, how to run the tests) so another engineer can understand the project without guessing.
