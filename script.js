// DOM needed
const mainCard = document.querySelector(".main-card");
const difficultyChangeButton = document.querySelector(".change");
const difficultyForm = document.querySelector(".difficulty");
const lastDefaultRow = document.querySelector("[data-state=lastDefaultRow]");
const resetButton = document.querySelector(".reset");
const root = document.documentElement; // <html> element
const mainTitle = document.querySelector(".main-title");
const gameBoard = document.querySelector(".game-board");
const difficultySubmitButton = document.querySelector(".difficulty__submit");

// Game Starter data

const gameMemory = {
  currentPlayer: null,
  gameLevel: 3, // default/starter level
  gridList: [],
  cellsGridList: [],
  diagonalBackward: null,
  diagonalForward: null,
  lineList: null,
  gameWinner: null,
};

// initialize game data

const initializeGridList = (gameLevel, gridList) => {
  for (let i = gameLevel; i > 0; i--) {
    let newRow = Array.from({ length: gameLevel });
    gridList.push(newRow);
  }
};

const addCustomAttributes = (cellsGridList) => {
  cellsGridList.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      cell.setAttribute("data-rowIndex", rowIndex);
      cell.setAttribute("data-cellIndex", cellIndex);
    });
  });
};

const initializeCellsGridList = (cellsGridList, gameCells, gameLevel) => {
  let sliceStartIndex = 0;

  for (let i = 0; i < gameLevel; i++) {
    let sliceEndIndex = (i + 1) * gameLevel;
    cellsGridList.push([...gameCells].slice(sliceStartIndex, sliceEndIndex));
    sliceStartIndex += Number(gameLevel);
  }
};

// Game difficulty Control
const switchingCards = (appear, disappear) => {
  if (disappear.classList.contains("appear")) {
    disappear.classList.remove("appear");
  } else if (appear.classList.contains("disappear")) {
    appear.classList.remove("disappear");
  }
  disappear.classList.add("disappear");
  appear.classList.add("appear");
};

const changeBoardSize = (gameBoard, gameLevel) => {
  const gameCells = gameBoard.querySelectorAll(".cell");
  root.style.setProperty("--number-of-columns", gameLevel);

  const requiredCells = Math.pow(gameLevel, 2);
  const currentCells = gameCells.length;

  const levelsDifference = Math.abs(requiredCells - currentCells);
  const defaultCell = '<button class="cell" type="button"></button>';

  if (currentCells < requiredCells) {
    const cellsToAdd = Array.from(
      { length: levelsDifference },
      (item) => defaultCell
    ).join("");
    gameBoard.insertAdjacentHTML("beforeend", cellsToAdd);
  } else if (currentCells > requiredCells) {
    const cellsToRemove = Array.from(
      { length: levelsDifference },
      (_, index) => gameCells[index]
    );
    cellsToRemove.forEach((cell) => cell.remove());
  }
};

const responsiveGridSizeControl = () => {
  document.querySelectorAll(".cell").forEach((cell) => {
    let width;

    if (
      (window.innerWidth < 1200 && gameMemory.gameLevel > 4) ||
      (window.innerWidth < 800 && gameMemory.gameLevel >= 4)
    ) {
      width = "min(3.5rem)";
    } else {
      width = "min(8.5rem)";
    }

    cell.style.width = width;
  });
};

const difficultyFormControl = (event) => {
  event.preventDefault();
  const gameBoard = document.querySelector(".game-board");

  gameLevel = document.querySelector(".difficulty__options").value;

  gameMemory.gameLevel = gameLevel;
  changeBoardSize(gameBoard, gameLevel);
  switchingCards(mainCard, difficultyForm);
  gameLogic(gameBoard);
  responsiveGridSizeControl();
};

difficultyForm.addEventListener("submit", difficultyFormControl);

difficultyChangeButton.addEventListener("click", () =>
  switchingCards(difficultyForm, mainCard)
);

// Game basic Functions
const getStarterPlayer = () => (Math.random() >= 0.5 ? "x" : "o");
const getNextPlayer = (currentPlayer) => (currentPlayer === "x" ? "o" : "x");
const changePlayerColor = (currentPlayer, cell) => {
  if (
    cell.classList.contains("player1-color") ||
    cell.classList.contains("player2-color")
  ) {
    cell.classList.remove("player1-color");
    cell.classList.remove("player2-color");
  }
  if (currentPlayer === "x") {
    cell.classList.add("player1-color");
  } else {
    cell.classList.add("player2-color");
  }
};

// cell Click Handler

const isBoardEmpty = () =>
  gameMemory.gridList.every((row) => row.every((cell) => !cell));

const isBoardFull = () =>
  gameMemory.gridList.every((row) => row.every((cell) => cell));

const getColumnsList = () =>
  Array.from({ length: gameMemory.gameLevel }, (_, index) =>
    gameMemory.cellsGridList.map((row) => row[index])
  );

const updateLineList = (list) => (gameMemory.lineList = list);

const winConditions = {
  line: function (parentList, player) {
    return parentList.some((childList) => {
      const lineWon = childList.every((item) => item.innerText === player);
      if (lineWon) {
        updateLineList(childList);
        return true;
      }
    });
  },
  diagonal: function (diagonalList, player) {
    return diagonalList.every((item) => item.innerText === player);
  },
};

const updateDiagonalLists = (diagonalList, diagonalType) => {
  const diagonalCells = Array.from(
    { length: gameMemory.gameLevel },
    (_, index) => diagonalList[index][index]
  );
  if (diagonalType === "backward") {
    gameMemory.diagonalBackward = diagonalCells;
  } else {
    gameMemory.diagonalForward = diagonalCells;
  }
};

const getPlayerWon = (parentList, condition, isDiagonal = false) => {
  if (isDiagonal) {
    parentList = getDiagonalList(parentList);
  }
  let players = ["x", "o"];
  for (let player of players) {
    if (condition(parentList, player)) {
      gameMemory.gameWinner = player;
      return player;
    }
  }
};

const styleWonCells = (winType) => {
  if (winType === "draw") return;
  let wonCells;
  if (winType === "Horizontally" || winType === "Vertically") {
    wonCells = gameMemory.lineList;
  } else if (winType === "forward") {
    wonCells = gameMemory.diagonalForward;
  } else if (winType === "backward") {
    wonCells = gameMemory.diagonalBackward;
  }
  wonCells.forEach((cell) => {
    cell.classList.add("click");
  });
};

const gameOver = (winner, winType) => {
  styleWonCells(winType);
  let wonMessage;
  if (winType === "forward" || winType === "backward") {
    winType = "diagonally";
  }
  if (winType === "draw") {
    wonMessage = `No winner this time`;
  } else {
    wonMessage = `Player <span class="player">${winner}</span> won <span class="won-type">${winType}</span>`;
  }

  mainTitle.innerHTML = wonMessage;
  const gameCells = document.querySelectorAll(".cell");

  gameCells.forEach((cell) =>
    cell.removeEventListener("click", cellButtonControl)
  );
};

const winCheckByType = (winType) => {
  if (winType === "line") {
    const rowWinner = getPlayerWon(
      gameMemory.cellsGridList,
      winConditions.line
    );
    const colWinner = getPlayerWon(getColumnsList(), winConditions.line);
    if (rowWinner) {
      gameOver(rowWinner, "Horizontally");
    } else if (colWinner) {
      gameOver(colWinner, "Vertically");
    }
  } else if (winType === "diagonal") {
    updateDiagonalLists(gameMemory.cellsGridList, "forward");
    updateDiagonalLists([...gameMemory.cellsGridList].reverse(), "backward");

    const isForwardWin = getPlayerWon(
      gameMemory.diagonalForward,
      winConditions.diagonal
    );
    const isBackwardWin = getPlayerWon(
      gameMemory.diagonalBackward,
      winConditions.diagonal
    );

    if (isForwardWin) {
      gameOver(isForwardWin, "forward");
    } else if (isBackwardWin) {
      gameOver(isBackwardWin, "backward");
    }
  }
};

const drawCheck = () => {
  if (isBoardFull() && !gameMemory.gameWinner) {
    gameOver(undefined, "draw");
  }
};

const makeMove = (cell) => {
  const cellRow = cell.getAttribute("data-rowIndex");
  const cellCell = cell.getAttribute("data-cellIndex");

  if (gameMemory.gridList[cellRow][cellCell]) return;

  if (isBoardEmpty()) {
    gameMemory.currentPlayer = getStarterPlayer();
  } else {
    gameMemory.currentPlayer = getNextPlayer(gameMemory.currentPlayer);
  }
  gameMemory.gridList[cellRow][cellCell] = gameMemory.currentPlayer;
  cell.innerText = gameMemory.currentPlayer;
  changePlayerColor(gameMemory.currentPlayer, cell);
};

const removePreviousClicks = () => {
  const previousClicked = document.querySelectorAll(".click");
  if (previousClicked) {
    previousClicked.forEach((cell) => cell.classList.remove("click"));
  }
};

const cellButtonControl = (event) => {
  if (event.currentTarget.innerText) return;

  removePreviousClicks();

  makeMove(event.currentTarget);
  winCheckByType("line");
  winCheckByType("diagonal");
  drawCheck();
  event.currentTarget.classList.add("click");
};

const gameReset = (gameCells) => {
  gameMemory.gridList = [];
  gameMemory.cellsGridList = [];
  gameMemory.currentPlayer = null;
  gameMemory.diagonalBackward = null;
  gameMemory.diagonalForward = null;
  gameMemory.gameWinner = null;
  gameCells.forEach((cell) => (cell.innerText = ""));

  removePreviousClicks();
};

const gameLogic = (gameBoard) => {
  const gameCells = gameBoard.querySelectorAll(".cell");
  mainTitle.innerText = "Tic Tac Toe";

  gameReset(gameCells);
  initializeGridList(gameMemory.gameLevel, gameMemory.gridList);
  initializeCellsGridList(
    gameMemory.cellsGridList,
    gameCells,
    gameMemory.gameLevel
  );
  addCustomAttributes(gameMemory.cellsGridList);

  gameCells.forEach((cell) =>
    cell.addEventListener("click", cellButtonControl)
  );
};

resetButton.addEventListener("click", () => gameLogic(gameBoard));

gameLogic(gameBoard);
