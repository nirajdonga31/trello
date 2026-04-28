const express = require("express");
const {
  hasRequiredText,
  isNonNegativeInteger
} = require("../utils/validation");
const {
  createBoard,
  createList,
  findBoard,
  findList,
  getBoards,
  insertListAt,
  removeBoard,
  removeList
} = require("../store");

const router = express.Router();

router.get("/boards", (req, res) => {
  res.json(getBoards());
});

router.post("/boards", (req, res) => {
  const { name } = req.body;

  if (!hasRequiredText(name)) {
    return res.status(400).json({ error: "name is required" });
  }

  const board = createBoard(name.trim());
  res.status(201).json(board);
});

router.get("/boards/:boardId", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  res.json(board);
});

router.patch("/boards/:boardId", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const { name } = req.body;

  if (!hasRequiredText(name)) {
    return res.status(400).json({ error: "name is required" });
  }

  board.name = name.trim();
  res.json(board);
});

router.delete("/boards/:boardId", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  removeBoard(board.id);
  res.status(204).send();
});

router.post("/boards/:boardId/lists", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const { name } = req.body;

  if (!hasRequiredText(name)) {
    return res.status(400).json({ error: "name is required" });
  }

  const list = createList(board, name.trim());
  res.status(201).json(list);
});

router.patch("/lists/:listId", (req, res) => {
  const result = findList(req.params.listId);

  if (!result) {
    return res.status(404).json({ error: "List not found" });
  }

  const { name } = req.body;

  if (!hasRequiredText(name)) {
    return res.status(400).json({ error: "name is required" });
  }

  result.list.name = name.trim();
  res.json(result.list);
});

router.patch("/lists/:listId/move", (req, res) => {
  const result = findList(req.params.listId);

  if (!result) {
    return res.status(404).json({ error: "List not found" });
  }

  const { targetIndex } = req.body;

  if (!isNonNegativeInteger(targetIndex)) {
    return res.status(400).json({ error: "targetIndex must be a non-negative integer" });
  }

  removeList(result.board, result.list.id);
  insertListAt(result.board, result.list, targetIndex);

  res.json({
    message: "List moved",
    list: result.list,
    targetIndex
  });
});

router.delete("/lists/:listId", (req, res) => {
  const result = findList(req.params.listId);

  if (!result) {
    return res.status(404).json({ error: "List not found" });
  }

  removeList(result.board, result.list.id);
  res.status(204).send();
});

module.exports = router;
