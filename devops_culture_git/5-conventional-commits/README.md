# HolbieBot

A tiny DevOps maintenance bot used to practice Conventional Commits.

## What it does

HolbieBot reports its status (name + energy level) and can start a deployment.
Energy is always kept within a valid range: between 0 and 100. Any value
above 100 is capped at 100, and any value below 0 is capped at 0.

## How to run the program

From this directory, run:

```bash
python3 devops_bot.py
```

Expected output:

```
HolbieBot is online with 100% energy
HolbieBot is online with 0% energy
Deployment started
```

## How to run the tests

From this directory, run:

```bash
python3 -m unittest
```

All tests should pass, covering:
- a normal energy value (unchanged)
- a value below 0 (clamped to 0)
- a value above 100 (clamped to 100)
