# PlantOS Copilot Instructions

## End-of-task checklist

Before finishing any coding task, review the changes made and check:

- **Docs** — do the [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), or any other docs need updating to reflect this change?
- **Tests** — do existing tests in `api/PlantOS.Tests/` need updating, or should new tests be added to cover this change?
- **Postman collection** — do `postman/PlantOS.postman_collection.json` or `postman/PlantOS.postman_environment.json` need updating (new endpoints, changed request/response shapes, renamed routes, etc.)?
- **Secure coding** — review the changes against the OWASP Top 10 (e.g. injection, broken access control, cryptographic failures, insecure design, security misconfiguration, vulnerable dependencies, authentication failures, data integrity failures, logging/monitoring gaps, SSRF) and fix any issues found.

Only make changes where they're actually needed — don't update docs, tests, or the Postman collection speculatively.
