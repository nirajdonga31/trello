# Architecture

- Backend is a small Express app with routes mounted from `src/routes/boards.js` and `src/routes/cards.js`.
- State is in-memory only, stored in `src/store.js`.
- IDs are stringified incrementing counters allocated in `src/store.js`.
- Boards contain `members`, `activity`, and `lists`.
- Lists contain `cards`.
- Cards contain `assigneeIds`, `comments`, `checklist`, and `archived` state.
