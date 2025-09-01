const getTargetCell = (list, row, column) => {
  const lastIndex = list.length - 1;

  if (row === -1) {
    row = lastIndex;
  } else if (column === -1) {
    column = lastIndex;
  } else if (row > lastIndex) {
    row = 0;
  } else if (column > lastIndex) {
    column = 0;
  }

  return list[row][column];
};

const arrowsControl = (event) => {
  if (!event.key.includes("Arrow")) return;

  const currentRow = Number(event.currentTarget.getAttribute("data-rowIndex"));
  const currentColumn = Number(
    event.currentTarget.getAttribute("data-cellIndex")
  );
  let targetRow;
  let targetColumn;

  if (event.key === "ArrowUp") {
    targetRow = currentRow - 1;
    targetColumn = currentColumn;
  } else if (event.key === "ArrowDown") {
    targetRow = currentRow + 1;
    targetColumn = currentColumn;
  } else if (event.key === "ArrowLeft") {
    targetRow = currentRow;
    targetColumn = currentColumn - 1;
  } else if (event.key === "ArrowRight") {
    targetRow = currentRow;
    targetColumn = currentColumn + 1;
  }

  getTargetCell(gameMemory.cellsGridList, targetRow, targetColumn).focus();
};

gameBoard
  .querySelectorAll(".cell")
  .forEach((cell) => cell.addEventListener("keydown", arrowsControl));