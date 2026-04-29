const assert = require("node:assert/strict");
const { beforeEach, test } = require("node:test");

const {
  createBoard,
  createCard,
  createChecklistItem,
  createComment,
  createList,
  duplicateCard,
  resetStore
} = require("../src/store");

beforeEach(() => {
  resetStore();
});

test("duplicating a card mints fresh nested ids while preserving comment and checklist content", () => {
  const board = createBoard("Board");
  const list = createList(board, "Todo");
  const card = createCard(list, "Ship it", "Important");
  const comment = createComment(card, "Looks good", "Alex");
  const item = createChecklistItem(card, "Deploy");

  item.done = true;
  card.assigneeIds.push("member-1");

  const duplicate = duplicateCard(list, card);

  assert.equal(duplicate.title, "Ship it Copy");
  assert.deepEqual(duplicate.assigneeIds, card.assigneeIds);
  assert.notStrictEqual(duplicate.comments, card.comments);
  assert.notStrictEqual(duplicate.checklist, card.checklist);
  assert.equal(duplicate.comments.length, 1);
  assert.equal(duplicate.checklist.length, 1);
  assert.notEqual(duplicate.comments[0].id, comment.id);
  assert.notEqual(duplicate.checklist[0].id, item.id);
  assert.deepEqual(duplicate.comments[0], {
    id: duplicate.comments[0].id,
    text: comment.text,
    author: comment.author,
    createdAt: comment.createdAt
  });
  assert.deepEqual(duplicate.checklist[0], {
    id: duplicate.checklist[0].id,
    text: item.text,
    done: item.done
  });
});
