const express = require("express");
const {
  isBoolean,
  hasRequiredText,
  isNonNegativeInteger,
  isNullableString,
  isStringArray
} = require("../utils/validation");
const {
  addBoardActivity,
  createChecklistItem,
  createCard,
  createComment,
  findCard,
  findChecklistItem,
  findList,
  findMember,
  findComment,
  moveCardToList,
  removeChecklistItem,
  removeComment,
  removeCard,
  searchCards
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

  if (!isNullableString(dueDate)) {
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
  addBoardActivity(result.board, "card.created", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: card.id,
    title: card.title
  });

  res.status(201).json(card);
});

router.get("/cards/search", (req, res) => {
  const { q = "" } = req.query;

  if (!hasRequiredText(q)) {
    return res.status(400).json({ error: "q is required" });
  }

  res.json(searchCards(String(q)));
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
    if (!isNullableString(dueDate)) {
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

  addBoardActivity(result.board, "card.updated", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id
  });
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

  const moveResult = moveCardToList(cardResult, listResult, targetIndex);

  res.json({
    message: "Card moved",
    card: moveResult.card,
    fromListId: moveResult.fromListId,
    toListId: moveResult.toListId
  });
});

router.patch("/cards/:cardId/archive", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { archived } = req.body;

  if (!isBoolean(archived)) {
    return res.status(400).json({ error: "archived must be a boolean" });
  }

  result.card.archived = archived;
  addBoardActivity(result.board, "card.archive_toggled", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    archived
  });

  res.json(result.card);
});

router.post("/cards/:cardId/duplicate", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const duplicate = createCard(
    result.list,
    `${result.card.title} Copy`,
    result.card.description,
    result.card.dueDate,
    [...result.card.labels]
  );

  duplicate.assigneeIds = [...result.card.assigneeIds];
  duplicate.comments = result.card.comments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    author: comment.author,
    createdAt: comment.createdAt
  }));
  duplicate.checklist = result.card.checklist.map((item) => ({
    id: item.id,
    text: item.text,
    done: item.done
  }));
  duplicate.archived = false;

  addBoardActivity(result.board, "card.duplicated", {
    boardId: result.board.id,
    listId: result.list.id,
    sourceCardId: result.card.id,
    newCardId: duplicate.id
  });

  res.status(201).json(duplicate);
});

router.post("/cards/:cardId/assignees", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { memberId } = req.body;
  const member = findMember(result.board, String(memberId));

  if (!member) {
    return res.status(404).json({ error: "Member not found on board" });
  }

  if (!result.card.assigneeIds.includes(member.id)) {
    result.card.assigneeIds.push(member.id);
  }

  addBoardActivity(result.board, "card.assignee_added", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    memberId: member.id
  });

  res.json(result.card);
});

router.delete("/cards/:cardId/assignees/:memberId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  result.card.assigneeIds = result.card.assigneeIds.filter(
    (memberId) => memberId !== req.params.memberId
  );

  addBoardActivity(result.board, "card.assignee_removed", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    memberId: req.params.memberId
  });

  res.status(204).send();
});

router.post("/cards/:cardId/comments", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { text, author = "system" } = req.body;

  if (!hasRequiredText(text)) {
    return res.status(400).json({ error: "text is required" });
  }

  if (!hasRequiredText(author)) {
    return res.status(400).json({ error: "author is required" });
  }

  const comment = createComment(result.card, text.trim(), author.trim());
  addBoardActivity(result.board, "comment.created", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    commentId: comment.id
  });

  res.status(201).json(comment);
});

router.patch("/cards/:cardId/comments/:commentId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const comment = findComment(result.card, req.params.commentId);

  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const { text } = req.body;

  if (!hasRequiredText(text)) {
    return res.status(400).json({ error: "text is required" });
  }

  comment.text = text.trim();
  addBoardActivity(result.board, "comment.updated", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    commentId: comment.id
  });

  res.json(comment);
});

router.delete("/cards/:cardId/comments/:commentId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const comment = findComment(result.card, req.params.commentId);

  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  removeComment(result.card, comment.id);
  addBoardActivity(result.board, "comment.deleted", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    commentId: comment.id
  });

  res.status(204).send();
});

router.post("/cards/:cardId/checklist", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const { text } = req.body;

  if (!hasRequiredText(text)) {
    return res.status(400).json({ error: "text is required" });
  }

  const item = createChecklistItem(result.card, text.trim());
  addBoardActivity(result.board, "checklist_item.created", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    itemId: item.id
  });

  res.status(201).json(item);
});

router.patch("/cards/:cardId/checklist/:itemId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const item = findChecklistItem(result.card, req.params.itemId);

  if (!item) {
    return res.status(404).json({ error: "Checklist item not found" });
  }

  const { text, done } = req.body;

  if (text !== undefined) {
    if (!hasRequiredText(text)) {
      return res.status(400).json({ error: "text is required" });
    }

    item.text = text.trim();
  }

  if (done !== undefined) {
    if (!isBoolean(done)) {
      return res.status(400).json({ error: "done must be a boolean" });
    }

    item.done = done;
  }

  addBoardActivity(result.board, "checklist_item.updated", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    itemId: item.id
  });

  res.json(item);
});

router.delete("/cards/:cardId/checklist/:itemId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  const item = findChecklistItem(result.card, req.params.itemId);

  if (!item) {
    return res.status(404).json({ error: "Checklist item not found" });
  }

  removeChecklistItem(result.card, item.id);
  addBoardActivity(result.board, "checklist_item.deleted", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    itemId: item.id
  });

  res.status(204).send();
});

router.delete("/cards/:cardId", (req, res) => {
  const result = findCard(req.params.cardId);

  if (!result) {
    return res.status(404).json({ error: "Card not found" });
  }

  addBoardActivity(result.board, "card.deleted", {
    boardId: result.board.id,
    listId: result.list.id,
    cardId: result.card.id,
    title: result.card.title
  });
  removeCard(result.list, result.card.id);
  res.status(204).send();
});

module.exports = router;
