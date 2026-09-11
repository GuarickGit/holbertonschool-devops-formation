## 4. When prod breaks: chase the cause, not the culprit

### Post-mortem — The Friday-night incident (PixelCart)

This post-mortem is blameless: it focuses on the system and process gaps that allowed a routine mistake to turn into 15 hours of checkout downtime, not on the individuals involved.

### Timeline (factual)

| Event | Time |
|---|---|
| **Occurred** | Friday, 5:52 pm — a configuration change (database URL) containing a typo is deployed to production. |
| **Detected** | Saturday, 9:15 am — an on-call team member discovers customer complaints (a customer had already reported the issue publicly at 8:30 pm Friday, but nobody on the team saw it until the next morning). |
| **Resolved** | Saturday, 11:40 am — after tracking down the person who deployed, identifying the typo, and fixing the configuration file by hand, service is restored. |

Total impact: roughly 15 hours of checkout downtime over a weekend, and a significant amount of lost revenue.

### Systemic causes (no finger-pointing)

1. **No automated deployment pipeline.** Deploying to production meant connecting over SSH and manually editing files directly on the server, with no automated checks in between a change and its release. A typo in a config value had no guardrail to catch it before it reached production.
2. **No production-like test environment.** Changes were tested "more or less" on a personal machine, with no environment that reliably mirrored production behavior, making it hard to catch this kind of issue before deployment.
3. **No monitoring or alerting.** Nothing in the system actively watched the health of the checkout flow. The team only learned about the outage indirectly, through a public social media complaint, many hours after it started.
4. **No deployment history or traceability.** There was no record of what had changed or when, which meant diagnosing the issue during the incident required manually reconstructing what had happened instead of consulting a log.
5. **No rollback mechanism and no shared on-call access.** Once the issue was suspected, there was no quick way to revert to a known-good state. Resolving it depended on reaching one specific person, since access and deployment knowledge were not shared across the team.

### Priority actions

**1. Set up an automated CI/CD pipeline with tests before deployment.**
This directly targets the root cause of the incident: a change with a typo reached production with no check in between. Automated tests and a pipeline (rather than manual SSH edits) would very likely have caught the invalid configuration before release.
→ Improves **change failure rate** — fewer deployments would reach production in a broken state.

**2. Set up monitoring and automated alerting on critical flows (e.g. checkout).**
The incident went unnoticed by the team for hours; it was a customer's public complaint that eventually surfaced it. Automated health checks and alerts would have notified the team within minutes of the failure instead of the next morning.
→ Improves **time to restore (MTTR)** — the time between the issue occurring and someone starting to fix it would shrink from hours to minutes.

**3. Track deployments in Git with a clear history, and add a fast rollback mechanism, with access shared across the team (not one person).**
Once the issue was suspected, the team had no record of what changed and no quick way to undo it, and resolution depended on reaching a single person. A tracked, small, revertible deployment process would let anyone on the team see what changed and roll it back quickly.
→ Improves **lead time for changes** (small, well-tracked changes move faster and more safely from commit to production) and further improves **MTTR** (a known-good state is one rollback away instead of a manual fix).

### Summary of DORA metrics addressed

- **Change failure rate** — addressed by action 1 (automated pipeline + tests).
- **Time to restore (MTTR)** — addressed by action 2 (monitoring/alerting) and reinforced by action 3 (rollback).
- **Lead time for changes** — addressed by action 3 (deployment traceability).
