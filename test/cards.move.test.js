const assert = require("node:assert/strict");
const { beforeEach, test } = require("node:test");

const {
  createBoard,
  createCard,
  createList,
  createMember,
  findCard,
  findList,
  moveCardToList,
  resetStore
} = require("../src/store");

beforeEach(() => {
  resetStore();
});

function createCrossBoardMoveFixture() {
  const sourceBoard = createBoard("Source Board");
  const destinationBoard = createBoard("Destination Board");
  const sourceList = createList(sourceBoard, "Todo");
  const destinationList = createList(destinationBoard, "Doing");
  const sourceMember = createMember(sourceBoard, "Alex");
  const card = createCard(sourceList, "Move me", "");

  card.assigneeIds.push(sourceMember.id);

  return {
    sourceBoard,
    destinationBoard,
    sourceList,
    destinationList,
    sourceMember,
    card
  };
}

test("cross-board card moves drop assignees missing from the destination board", () => {
  const fixture = createCrossBoardMoveFixture();
  const cardResult = findCard(fixture.card.id);
  const listResult = findList(fixture.destinationList.id);

  const moveResult = moveCardToList(cardResult, listResult);

  assert.deepEqual(moveResult.card.assigneeIds, []);
  assert.deepEqual(findCard(fixture.card.id).card.assigneeIds, []);
});

test("cross-board card moves add activity entries to both boards", () => {
  const fixture = createCrossBoardMoveFixture();
  const cardResult = findCard(fixture.card.id);
  const listResult = findList(fixture.destinationList.id);

  moveCardToList(cardResult, listResult);

  const sourceMoveEntry = fixture.sourceBoard.activity.find(
    (entry) => entry.type === "card.moved" && entry.details.cardId === fixture.card.id
  );
  const destinationMoveEntry = fixture.destinationBoard.activity.find(
    (entry) => entry.type === "card.moved" && entry.details.cardId === fixture.card.id
  );

  assert.ok(sourceMoveEntry);
  assert.ok(destinationMoveEntry);
  assert.equal(sourceMoveEntry.details.toBoardId, fixture.destinationBoard.id);
  assert.equal(destinationMoveEntry.details.fromBoardId, fixture.sourceBoard.id);
});
