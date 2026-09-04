## 3. How do you know a team is any good? You measure.

**Q1.** Match each DORA metric to its definition.

- **Deployment frequency**: how often an organization successfully deploys code to production.
- **Lead time for changes**: the time it takes for a commit (or a merged change) to reach production.
- **Change failure rate**: the percentage of deployments that cause a failure in production (incident, bug, rollback...).
- **Time to restore / MTTR**: once an incident happens in production, how long it takes to restore the service to a normal state.

**Q2.** A team deploys once a quarter. Which metric is poor?

Deployment frequency. Deploying once a quarter is an extremely low release cadence — elite teams typically deploy on demand, often multiple times a day. A quarterly cadence places this team in the lowest performance category on this specific metric.

**Q3.** You shorten the time between merging a PR and shipping it to production. Which metric improves?

Lead time for changes. That is literally what this metric tracks: the time between code being ready (merged) and code being live for users.

**Q4.** 1 deployment out of 4 causes an incident. Which metric is this, and is a high value good or bad?

This is the change failure rate (here, 25%). A high value is bad: it means a large share of deployments break something in production. Unlike deployment frequency and lead time (where "more/faster" is good), change failure rate and MTTR are metrics we want to keep as low as possible.

**Q5.** What does the acronym CALMS stand for?

CALMS stands for **C**ulture, **A**utomation, **L**ean, **M**easurement, **S**haring:
- Culture: collaboration and trust between dev and ops, breaking down silos.
- Automation: automating repetitive work (tests, deployments...) to reduce manual error and save time.
- Lean: small changes, short feedback loops, eliminating waste.
- Measurement: measuring outcomes to know if the team is actually improving (this is where DORA metrics come in).
- Sharing: sharing knowledge, feedback and responsibility across the team instead of keeping it siloed.

**Q6.** True or false: "elite" teams deploy less often but in bigger batches. Justify your answer.

False. Elite teams deploy frequently — often multiple times a day — in small batches, which is the opposite of rare, large-batch releases. Deploying often in small batches makes each change easier to test, review, and roll back if something goes wrong, which directly reduces risk compared to large, infrequent releases.

**Q7.** Which practice improves MTTR the most?

**(b) monitoring and alerting plus automated rollback.**

MTTR measures how fast a team restores service after an incident. Monitoring and alerting shorten the time to *detect* a problem (instead of waiting for a user to report it), and automated rollback shortens the time to *recover* once the problem is known. More manual approval steps (a) slow down the response instead of speeding it up, and batching deployments once a month (c) has nothing to do with recovery speed and contradicts the small-batch, frequent-deployment practice from Q6.

**Q8.** Among the 4 DORA metrics, which measure throughput and which measure stability?

- **Throughput**: deployment frequency, lead time for changes — they measure how fast and how often the team delivers value.
- **Stability**: change failure rate, time to restore (MTTR) — they measure how reliable those deployments are once they reach production.

**Q9.** Why do we run blameless post-mortems?

Because incidents are almost never caused by a single person making a mistake — they are usually the result of several factors lining up together (process gaps, tooling limitations, missing context, prior decisions...). Looking for a single culprit is a simplistic and inaccurate way to understand how complex systems actually fail.

Blameless post-mortems also protect transparency: if every incident ends with "who caused this," people start protecting themselves instead of being honest — they minimize details, hide information, or avoid reporting problems out of fear of consequences. That transparency is exactly what's needed to understand the real root cause and prevent the same incident from happening again. Removing blame is what makes people willing to share the full, honest picture.
