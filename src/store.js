let nextBoardId = 1;
let nextListId = 1;
let nextCardId = 1;
let nextMemberId = 1;
let nextCommentId = 1;
let nextChecklistItemId = 1;
let nextActivityId = 1;

const db = {
  boards: []
};

function resetStore() {
  nextBoardId = 1;
  nextListId = 1;
  nextCardId = 1;
  nextMemberId = 1;
  nextCommentId = 1;
  nextChecklistItemId = 1;
  nextActivityId = 1;
  db.boards = [];
}

function createBoard(name) {
  const board = {
    id: String(nextBoardId++),
    name,
    members: [],
    activity: [],
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

function addBoardActivity(board, type, details = {}) {
  const entry = {
    id: String(nextActivityId++),
    type,
    details,
    createdAt: new Date().toISOString()
  };

  board.activity.unshift(entry);
  return entry;
}

function createMember(board, name) {
  const member = {
    id: String(nextMemberId++),
    name
  };

  board.members.push(member);
  return member;
}

function findMember(board, memberId) {
  return board.members.find((member) => member.id === memberId);
}

function removeMember(board, memberId) {
  board.members = board.members.filter((member) => member.id !== memberId);

  for (const list of board.lists) {
    for (const card of list.cards) {
      card.assigneeIds = card.assigneeIds.filter((id) => id !== memberId);
    }
  }
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
    assigneeIds: [],
    comments: [],
    checklist: [],
    archived: false,
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

function moveCardToList(cardResult, listResult, targetIndex) {
  const isCrossBoardMove = cardResult.board.id !== listResult.board.id;

  if (isCrossBoardMove) {
    cardResult.card.assigneeIds = cardResult.card.assigneeIds.filter((memberId) =>
      Boolean(findMember(listResult.board, memberId))
    );
  }

  removeCard(cardResult.list, cardResult.card.id);

  if (targetIndex === undefined) {
    listResult.list.cards.push(cardResult.card);
  } else {
    insertCardAt(listResult.list, cardResult.card, targetIndex);
  }

  const activityDetails = {
    cardId: cardResult.card.id,
    fromBoardId: cardResult.board.id,
    toBoardId: listResult.board.id,
    fromListId: cardResult.list.id,
    toListId: listResult.list.id,
    targetIndex: targetIndex ?? null
  };

  addBoardActivity(cardResult.board, "card.moved", {
    boardId: cardResult.board.id,
    ...activityDetails
  });

  if (isCrossBoardMove) {
    addBoardActivity(listResult.board, "card.moved", {
      boardId: listResult.board.id,
      ...activityDetails
    });
  }

  return {
    card: cardResult.card,
    fromListId: cardResult.list.id,
    toListId: listResult.list.id
  };
}

function createComment(card, text, author = "system") {
  const comment = {
    id: String(nextCommentId++),
    text,
    author,
    createdAt: new Date().toISOString()
  };

  card.comments.push(comment);
  return comment;
}

function findComment(card, commentId) {
  return card.comments.find((comment) => comment.id === commentId);
}

function removeComment(card, commentId) {
  card.comments = card.comments.filter((comment) => comment.id !== commentId);
}

function createChecklistItem(card, text) {
  const item = {
    id: String(nextChecklistItemId++),
    text,
    done: false
  };

  card.checklist.push(item);
  return item;
}

function findChecklistItem(card, itemId) {
  return card.checklist.find((item) => item.id === itemId);
}

function removeChecklistItem(card, itemId) {
  card.checklist = card.checklist.filter((item) => item.id !== itemId);
}

function searchCards(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const results = [];

  for (const board of db.boards) {
    for (const list of board.lists) {
      for (const card of list.cards) {
        const haystack = [
          card.title,
          card.description,
          ...card.labels,
          ...card.comments.map((comment) => comment.text)
        ]
          .join(" ")
          .toLowerCase();

        if (haystack.includes(normalizedQuery)) {
          results.push({
            boardId: board.id,
            boardName: board.name,
            listId: list.id,
            listName: list.name,
            card
          });
        }
      }
    }
  }

  return results;
}

module.exports = {
  addBoardActivity,
  createChecklistItem,
  createBoard,
  createCard,
  createComment,
  createList,
  createMember,
  findBoard,
  findCard,
  findChecklistItem,
  findList,
  findComment,
  findMember,
  getBoards,
  insertCardAt,
  insertListAt,
  moveCardToList,
  removeChecklistItem,
  removeBoard,
  removeComment,
  removeMember,
  removeList,
  removeCard,
  resetStore,
  searchCards
};
