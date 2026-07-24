# PlantOS Copilot Instructions

## End-of-task checklist

Before finishing any coding task that changed code, delegate each of the following checks to its dedicated subagent rather than doing the work inline:

- **Docs** — invoke the `docs` subagent to check whether [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), or any other docs need updating to reflect this change.
- **Postman collection** — invoke the `postman` subagent to check whether `postman/PlantOS.postman_collection.json` or `postman/PlantOS.postman_environment.json` need updating (new endpoints, changed request/response shapes, renamed routes, etc.).
- **Tests** — invoke the `test-creation` subagent to check whether existing tests in `api/PlantOS.Tests/` need updating, or new tests should be added to cover this change.
- **Secure coding** — invoke the `security-review` subagent to review the changes against the OWASP Top 10 (e.g. injection, broken access control, cryptographic failures, insecure design, security misconfiguration, vulnerable dependencies, authentication failures, data integrity failures, logging/monitoring gaps, SSRF), then fix any issues it finds.

Only make changes where they're actually needed — don't update docs, tests, or the Postman collection speculatively. Skip this checklist for changes that don't touch code (e.g. answering a question).
