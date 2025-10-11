const arr = [
	[null, null, null],
	[null, null, null],
	[null, null, null],
];

const winOptions =  [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]]
];

const container = document.getElementById('container');
const turn = document.getElementById('turn');
const info = document.getElementById('info');
const player1Display = document.getElementById('player1Display');
const player2Display = document.getElementById('player2Display');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const gamemodeBtn = document.getElementById('gamemodeBtn');

const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const oIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-icon lucide-circle"><circle cx="12" cy="12" r="10"/></svg>`;

let player1 = 'P1',
		player2 = 'Computer',
		currentTurn = player1,
		player1Score = 0,
		player2Score = 0,
		isGameOver = false,
		vsComputer = true,
		isPlayerTurn = true;

restartBtn.style.display = 'none';

container.addEventListener('click', event => {
	if (!isPlayerTurn || isGameOver) return;

	let cell = event.target.closest('.cell');
	if (!cell) return;

	const row = cell.parentElement;
	const colIndex = getColIndex(cell, row);
	const rowIndex = getRowIndex(row);

	doMove(rowIndex, colIndex, cell);
});

gamemodeBtn.addEventListener('click', () => {
	vsComputer = !vsComputer;
	player2 = vsComputer ? 'Computer' : 'P2';
	updatePlayerDisplays();
	restartGame();
});

const getRowIndex = row => {
	const rows = row.parentElement.querySelectorAll('.row');
	return Array.from(rows).indexOf(row);
};

const getColIndex = (cell, row) => {
	return Array.from(row.children).indexOf(cell);
};

const isCellAvailable = (arr, rowIndex, colIndex) => {
	return arr[rowIndex][colIndex] === null;
};

const doMove = (rowIndex, colIndex, cell) => {
	if (isGameOver) return;
	if (!isCellAvailable(arr, rowIndex, colIndex)) {
		invalidMove();
		return;
	}

	arr[rowIndex][colIndex] = currentTurn;
	cell.innerHTML = currentTurn === player1 ? xIcon : oIcon;

	const result = checkWinner();
	if (result) return handleWin(result);
	if (isBoardFull()) return handleTie();

	switchTurn();

	// if it's the computer's turn, blocks the ability for the player to click
	if (vsComputer && currentTurn === player2 && !isGameOver) {
		isPlayerTurn = false;
		setTimeout(() => computerMove(), 1000);
	}
};

const computerMove = () => {
	const emptyCells = [];
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			if (arr[row][col] === null) {
				emptyCells.push([row, col]);
			}
		}
	}
	if (emptyCells.length === 0) return;

	const [rowIndex, colIndex] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
	const rows = document.querySelectorAll('.row');
	const cell = rows[rowIndex].children[colIndex];

	doMove(rowIndex, colIndex, cell);
	isPlayerTurn = true;

	// clear icon hover effect after computer plays
	const cells = document.querySelectorAll('.cell');
	cells.forEach(cell => (cell.style.backgroundImage = ''));
};

const invalidMove = () => {
	setTurn('This cell is already taken, try again.', '#ff6b6b');
	// display the turn after 1.5 seconds
	setTimeout(() => {
		setTurn(`${currentTurn}'s turn`, 'var(--text-white)');
	}, 1500);
};

const switchTurn = () => {
	currentTurn = currentTurn === player1 ? player2 : player1;
	setTurn(`${currentTurn}’s turn`, 'var(--text-white)');
};

const checkWinner = () => {
	for (const winOption of winOptions) {
		const [[row1, col1], [row2, col2], [row3, col3]] = winOption;
		const first = arr[row1][col1];
		const second = arr[row2][col2];
		const third = arr[row3][col3];

		if (first && first === second && first === third) {
			return { winner: first, winCombo: winOption };
		}
	}
	return null;
};

const handleWin = ({ winner, winCombo }) => {
	isGameOver = true;
	setTurn(`${winner} wins! 🎉`, 'var(--highlight-green)');
	setInfo(`Press 'Play Again' to continue or 'Restart' to reset the scores.`);

	// highlight the 3 winning cells
	const rows = document.querySelectorAll('.row');
	for (const [row, col] of winCombo) {
		const cell = rows[row].children[col];
		cell.classList.add('winner');
	}
	updateScore(winner);
};

const handleTie = () => {
	isGameOver = true;
	setTurn('It’s a tie! 🤝', 'var(--cyan-500)');

	// fade icons when game is tied
	const cells = document.querySelectorAll('.cell');
	cells.forEach(cell => (cell.style.opacity = '0.5'));

	// display the restart option only if any player has at least 1 point
	player1Score === 0 && player2Score === 0
		? setInfo(`Press 'Play Again' to continue.`)
		: setInfo(`Press 'Play Again' to continue or 'Restart' to reset the scores.`);
};

const isBoardFull = () => !arr.flat().includes(null);

const updateScore = winner => {
	setTimeout(() => {
		if (winner === 'P1') player1Score++;
		else if (winner === 'P2' || winner === 'Computer') player2Score++;

		updatePlayerDisplays();
		displayRestartBtn();
	}, 500);
};

const updatePlayerDisplays = () => {
	player1Display.textContent = `P1 Score: ${player1Score}`;
	player2Display.textContent = vsComputer
		? `Computer Score: ${player2Score}`
		: `P2 Score: ${player2Score}`;
};

const displayRestartBtn = () => {
	if (player1Score > 0 || player2Score > 0) {
		restartBtn.style.display = 'inline-block';
	} else {
		restartBtn.style.display = 'none';
	}
};

const restartGame = () => {
	player1Score = 0;
	player2Score = 0;
	updatePlayerDisplays();
	restartBtn.style.display = 'none';
	playAgain();
};
restartBtn.addEventListener('click', restartGame);

const playAgain = () => {
	// clear the board array
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			arr[row][col] = null;
		}
	}

	// clear all cells in the board
	const cells = document.querySelectorAll('.cell');
	cells.forEach(cell => {
		cell.innerHTML = '';
		cell.classList.remove('winner');
		cell.style.opacity = '1';
	});

	// reset game state
	isGameOver = false;
	currentTurn = player1;
	isPlayerTurn = true;

	setTurn(`${currentTurn}’s turn`, 'var(--text-white)');
	setInfo(
		vsComputer
			? `Playing vs Computer, press the 'Gamemode' button to play as 2 players.`
			: `Playing 2 Players, press the 'Gamemode' button to play vs Computer.`
	);
};
playAgainBtn.addEventListener('click', playAgain);

// adding a hover effect on cells to display a preview of the player's icon
const board = document.getElementById('board');

board.addEventListener('mouseover', event => {
	// prevents hover effects / background image on mobile
	if(window.innerWidth <= 600) return;

	const cell = event.target.closest('.cell');
	if (!cell) return;

	const row = cell.parentElement;
	const rowIndex = getRowIndex(row);
	const colIndex = getColIndex(cell, row);

	if (arr[rowIndex][colIndex] === null && !isGameOver) {
		cell.style.backgroundImage =
			currentTurn === player1 ? 'url(./icons/xicon.svg)' : 'url(./icons/oicon.svg';
		cell.style.backgroundRepeat = 'no-repeat';
		cell.style.backgroundPosition = 'center';
	}
});

board.addEventListener('mouseout', event => {
	const cell = event.target.closest('.cell');
	if (!cell) return;

	cell.style.backgroundImage = '';
});

// helper function that changes the turn's text content and color accordingly
const setTurn = (text, color) => {
	turn.innerText = text;
	turn.style.color = color;
};

const setInfo = text => {
	info.innerText = text;
};
