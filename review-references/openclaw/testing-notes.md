# Testing Notes

- Test runner is Node's built-in `node --test` exposed via `npm test`.
- Current coverage in this area includes cross-board card move behavior.
- Current coverage also includes duplicate-card nested ID behavior (comments/checklist items should mint fresh IDs).
- New card lifecycle features should keep adding regression tests when behavior depends on ID uniqueness or persisted relationships.
