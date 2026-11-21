# worklog/WL-1795290324-crismmolina-1-HR-017-hack.MZyMIJ.md · HR-017

## Live summary
- Done: Claim created; implementation pending
- Decision: Own branch and worktree
- Why: Parallel work without touching the main checkout
- Failing: No validation run yet
- Commands: `npm --prefix web test -- --run src/features/map && npm --prefix web run build`
- Next: Write its tests, see them fail (uak red HR-017), then implement until this passes: `npm --prefix web test -- --run src/features/map && npm --prefix web run build`

## History
- 1795290324 | CLAIMED | crismmolina-1 | claim; next: Write its tests, see them fail (uak red HR-017), then implement until this passes: `npm --prefix web test -- --run src/features/map && npm --prefix web run build` | Harness: unknown | Model: unknown
