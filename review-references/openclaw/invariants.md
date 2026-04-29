# Invariants

- A card belongs to exactly one list.
- A list belongs to exactly one board.
- `card.assigneeIds` should reference members on the card's current board.
- Comment IDs and checklist item IDs should be unique identifiers, not duplicated across independent items.
- Board activity should reflect meaningful board-scoped state changes.
