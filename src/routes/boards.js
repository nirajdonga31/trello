const express = require("express");
const {
  hasRequiredText,
  isNonNegativeInteger
} = require("../utils/validation");
const {
  addBoardActivity,
  createBoard,
  createList,
  createMember,
  findBoard,
  findList,
  findMember,
  getBoards,
  insertListAt,
  removeBoard,
  removeMember,
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
  addBoardActivity(board, "board.created", { boardId: board.id, name: board.name });
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
  addBoardActivity(board, "board.renamed", { boardId: board.id, name: board.name });
  res.json(board);
});

router.delete("/boards/:boardId", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  addBoardActivity(board, "board.deleted", { boardId: board.id, name: board.name });
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
  addBoardActivity(board, "list.created", { boardId: board.id, listId: list.id, name: list.name });
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
  addBoardActivity(result.board, "list.renamed", {
    boardId: result.board.id,
    listId: result.list.id,
    name: result.list.name
  });
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
  addBoardActivity(result.board, "list.moved", {
    boardId: result.board.id,
    listId: result.list.id,
    targetIndex
  });

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

  addBoardActivity(result.board, "list.deleted", {
    boardId: result.board.id,
    listId: result.list.id,
    name: result.list.name
  });
  removeList(result.board, result.list.id);
  res.status(204).send();
});

router.get("/boards/:boardId/activity", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  res.json(board.activity);
});

router.get("/boards/:boardId/members", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  res.json(board.members);
});

router.post("/boards/:boardId/members", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const { name } = req.body;

  if (!hasRequiredText(name)) {
    return res.status(400).json({ error: "name is required" });
  }

  const member = createMember(board, name.trim());
  addBoardActivity(board, "member.added", {
    boardId: board.id,
    memberId: member.id,
    name: member.name
  });

  res.status(201).json(member);
});

router.delete("/boards/:boardId/members/:memberId", (req, res) => {
  const board = findBoard(req.params.boardId);

  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const member = findMember(board, req.params.memberId);

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  addBoardActivity(board, "member.removed", {
    boardId: board.id,
    memberId: member.id,
    name: member.name
  });
  removeMember(board, member.id);

  res.status(204).send();
});

module.exports = router;
