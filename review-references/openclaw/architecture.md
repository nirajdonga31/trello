# Architecture

- Express app mounts `src/routes/boards.js` and `src/routes/cards.js` from `src/app.js`.
- Persistence is in-memory only via `src/store.js`.
- Boards own `members`, `activity`, and `lists`.
- Lists own `cards`.
- Cards own `assigneeIds`, `comments`, `checklist`, and `archived` state.
