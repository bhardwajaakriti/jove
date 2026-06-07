# JoVE AI Workflows

Frontend-only mock prototype for the two PRD features:

- AI-Powered Video Manuscript & Script Generator
- AI-Powered Multilingual Localization Engine

The app follows the `agentic_hub_coworkers` data-loading pattern: typed data-source contracts, an env-selected registry, cached bundled JSON loaders, deterministic mock-data generation, mapper-based filtering/KPI logic, and async hooks in UI pages.

## Run

```bash
npm install
npm run mock:gen
npm run dev
```

Optional mock controls:

```bash
VITE_JOVE_DATA_SOURCE=mock
VITE_MOCK_LATENCY=off | fast | normal | slow
VITE_ENABLE_MOCKS=true
```
