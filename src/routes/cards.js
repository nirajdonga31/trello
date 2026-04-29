const express = require("express");
const {
  hasRequiredText,
  isNonNegativeInteger,
  isStringArray
} = require("../utils/validation");
const {
  createCard,
  findCard,
  findList,
  insertCardAt,
  removeCard
} = require("../store");

const router = express.Router();

router.post("/lists/:listId/cards", (req, res) => {
  const result = findList(req.params.listId);

  if (!result) {
    return res.status(404).json({ error: "List not found" });
  }

  const { title, description = "", dueDate = null, labels = [] } = req.body;

  if (!hasRequiredText(title)) {
    return res.status(400).json({ error: "title is required" });
  }

  if (dueDate !== null && typeof dueDate !== "string") {
    return res.status(400).json({ error: "dueDate must be a string or null" });
  }

  if (!isStringArray(labels)) {
    return res.status(400).json({ error: "labels must be an array of strings" });
  }

  const safeDescription = typeof description === "string" ? description : "";
  const card = createCard(
    result.list,
    title.trim(),
    safeDescription,
    dueDate,
    labels
  );

  res.status(201).json(card);
});

router.get("/cards/:cardId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  res.json(result.card);
});

router.patch("/cards/:cardId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { title, description, dueDate, labels } = req.body;

  if (title !== undefined) {
    if (!hasRequiredText(title)) {
      return res.status(400).json({ error: "title is required" });
    }

    result.card.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "description must be a string" });
    }

    result.card.description = description;
  }

  if (dueDate !== undefined) {
    if (dueDate !== null && typeof dueDate !== "string") {
      return res.status(400).json({ error: "dueDate must be a string or null" });
    }

    result.card.dueDate = dueDate;
  }

  if (labels !== undefined) {
    if (!isStringArray(labels)) {
      return res.status(400).json({ error: "labels must be an array of strings" });
    }

    result.card.labels = labels;
  }

  res.json(result.card);
});

router.patch("/cards/:cardId/move", (req, res) => {
  const cardResult = findCard(req.params.cardId);

  if (!cardResult) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { targetListId, targetIndex } = req.body;
  const listResult = findList(String(targetListId));

  if (!listResult) {
    return res.status(404).json({ error: "Target list not found" });
  }

  if (targetIndex !== undefined && !isNonNegativeInteger(targetIndex)) {
    return res.status(400).json({ error: "targetIndex must be a non-negative integer" });
  }

  removeCard(cardResult.list, cardResult.card.id);
  if (targetIndex === undefined) {
    listResult.list.cards.push(cardResult.card);
  } else {
    insertCardAt(listResult.list, cardResult.card, targetIndex);
  }

  res.json({
    message: "Card moved",
    card: cardResult.card,
    fromListId: cardResult.list.id,
    toListId: listResult.list.id
  });
});

router.delete("/cards/:cardId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  removeCard(result.list, result.card.id);
  res.status(204).send();
});

module.exports = router;
