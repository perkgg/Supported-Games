## What does this PR do?

<!-- One sentence. "Adds X game", "Fixes Y field in Z definition", "Adds new field type", etc. -->

## Checklist

- [ ] `bun run typecheck` passes
- [ ] Stable `identity.id` slug is lowercase, kebab-case, and will never need to change
- [ ] All required `PodVariable` fields are present (`required`, `userEditable`, `userViewable`, `rules`)
- [ ] `playerIdType` is set correctly for the game's account platform
- [ ] Port bindings include all ports the server binds (game, query, RCON if applicable)
- [ ] `defaultMemoryMb` and `defaultCpu` are conservative defaults users can raise

## Notes for reviewer

<!-- Anything non-obvious: why a specific Docker image was chosen, why a field is non-editable, etc. -->
