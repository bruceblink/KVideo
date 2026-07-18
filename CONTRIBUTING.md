# Contributing

## Baseline

Contributions are expected to preserve the security and runtime behavior of this repository:

- secure outbound request policy
- private-by-default relay endpoints
- explicit auth secret requirements
- Workers/OpenNext Cloudflare path

Do not reintroduce permissive relay behavior, wildcard CORS, cookie forwarding, TLS verification bypasses, or public private-network fetches.

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker if you need to run the image/build checks locally

Install dependencies:

```bash
pnpm install
```

## Development Commands

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm cf:build
docker compose config
docker build -t kvideo .
```

## Required Checks Before a PR

At minimum, run the checks relevant to the code you changed. For broad or infrastructure-facing work, run the full matrix:

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm cf:build`
- `pnpm audit --prod`
- `docker compose config`
- `docker build -t kvideo .`

If you touch user flows, add or update Playwright smoke coverage in [`playwright`](playwright).

## Style Expectations

- Keep changes scoped and intentional.
- Prefer testable extraction over speculative abstraction.
- Do not add fake compatibility aliases for insecure legacy behavior.
- Do not depend on arbitrary file-length limits. CI-backed quality gates matter; line counts do not.
- Keep documentation accurate to the actual runtime behavior of the branch.

## Pull Requests

Each PR should include:

- what changed
- why it changed
- risk areas
- validation performed
- any deployment/env var changes

If a change affects relay, auth, sync, IPTV, PWA behavior, or Workers deployment, say so explicitly in the PR body.
