let nextBoardId = 1;
let nextListId = 1;
let nextCardId = 1;

const db = {
  boards: []
};

function createBoard(name) {
  const board = {
    id: String(nextBoardId++),
    name,
    lists: []
  };

  db.boards.push(board);
  return board;
}

function getBoards() {
  return db.boards;
}

function findBoard(boardId) {
  return db.boards.find((board) => board.id === boardId);
}

function removeBoard(boardId) {
  db.boards = db.boards.filter((board) => board.id !== boardId);
}

function createList(board, name) {
  const list = {
    id: String(nextListId++),
    name,
    cards: []
  };

  board.lists.push(list);
  return list;
}

function findList(listId) {
  for (const board of db.boards) {
    const list = board.lists.find((item) => item.id === listId);
    if (list) {
      return { board, list };
    }
  }

  return null;
}

function removeList(board, listId) {
  board.lists = board.lists.filter((list) => list.id !== listId);
}

function insertListAt(board, list, targetIndex) {
  const safeIndex = Math.max(0, Math.min(targetIndex, board.lists.length));
  board.lists.splice(safeIndex, 0, list);
}

function createCard(list, title, description, dueDate = null, labels = []) {
  const card = {
    id: String(nextCardId++),
    title,
    description,
    dueDate,
    labels,
    createdAt: new Date().toISOString()
  };

  list.cards.push(card);
  return card;
}

function findCard(cardId) {
  for (const board of db.boards) {
    for (const list of board.lists) {
      const card = list.cards.find((item) => item.id === cardId);
      if (card) {
        return { board, list, card };
      }
    }
  }

  return null;
}

function removeCard(list, cardId) {
  list.cards = list.cards.filter((card) => card.id !== cardId);
}

function insertCardAt(list, card, targetIndex) {
  const safeIndex = Math.max(0, Math.min(targetIndex, list.cards.length));
  list.cards.splice(safeIndex, 0, card);
}

module.exports = {
  createBoard,
  createCard,
  createList,
  findBoard,
  findCard,
  findList,
  getBoards,
  insertCardAt,
  insertListAt,
  removeBoard,
  removeList,
  removeCard
};
