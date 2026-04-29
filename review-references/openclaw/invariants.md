# Invariants

- A card should belong to exactly one list.
- A list belongs to exactly one board.
- `card.assigneeIds` should reference members that exist on the card's board.
- Board activity is board-scoped; changes affecting a board should be visible in that board's activity feed.
- Route-layer validation is expected before mutating in-memory state.
