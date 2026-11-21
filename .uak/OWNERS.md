# Shared-file owners

One writer per shared file. Others ask the owner with `uak msg ID --kind request`. Patterns are relative, with no spaces; directories end in `/`.
An owner is not a prerequisite for everyone: consumers work on published contracts and mocks. To transfer ownership, open a PR to main.

| Pattern | Owner task |
|---|---|
| web/package.json | HR-001 |
| web/package-lock.json | HR-001 |
| web/vite.config.ts | HR-001 |
| web/src/main.tsx | HR-001 |
| web/src/schemas/ | HR-001 |
| web/src/store/ | HR-001 |
| .github/workflows/ | HR-001 |
| web/src/App.tsx | HR-002 |
| web/src/index.css | HR-002 |
| web/src/lib/ui/ | HR-002 |
| web/DESIGN.md | HR-002 |
