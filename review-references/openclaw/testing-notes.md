# Testing Notes

- Test runner is Node's built-in `node --test` exposed via `npm test`.
- Current coverage in this area includes cross-board card move behavior.
- New card lifecycle features (duplicate, comments, checklist, search) need dedicated regression tests when behavior depends on ID uniqueness or persisted relationships.
