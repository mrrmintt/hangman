const socket = io();

// Function to create a game
function createGame() {
    socket.emit('createGame');
}

// Show join game input
function showJoinGame() {
    document.getElementById('joinGameSection').style.display = 'block';
}

// Function to join a game
function joinGame() {
    const gameCode = document.getElementById('joinCode').value;
    socket.emit('joinGame', gameCode);
}

// Start the game (only available for the game creator)
function startGame() {
    const gameCode = document.getElementById('gameCode').textContent;
    socket.emit('startGame', gameCode);
}

// Listen for gameCreated event and display the game code
socket.on('gameCreated', (data) => {
    document.getElementById('gameCodeSection').style.display = 'block';
    document.getElementById('gameCode').textContent = data.gameCode;
    document.getElementById('startGameButton').style.display = 'block';
});

// Listen for joinedGame event
socket.on('joinedGame', (data) => {
    if (data.success) {
        // Hide the join game section and display game status
        document.getElementById('joinGameSection').style.display = 'none';
        document.getElementById('gameStatus').textContent = `Joined game: ${data.gameCode}`;

        // Disable or hide the "Create Game" and "Join Game" buttons
        document.querySelector("button[onclick='createGame()']").disabled = true;
        document.querySelector("button[onclick='showJoinGame()']").disabled = true;
    } else {
        alert(data.message || 'Failed to join the game');
    }
});


// Listen for new player joining
socket.on('newPlayer', (message) => {
    console.log(message);
});

// Redirect all players to the game page when the game starts
socket.on('gameStarted', () => {
    window.location.href = '/hangman';
});
// Display the current player count
socket.on('playerCountUpdate', (playerCount) => {
    const playerCountSection = document.getElementById('playerCountSection');
    playerCountSection.style.display = 'block';
    playerCountSection.innerHTML = `Connected players: ${playerCount}`;
});
// Hide or disable the "Create Game" and "Join Game" buttons
function disableGameButtons() {
    document.querySelector("button[onclick='createGame()']").disabled = true;
    document.querySelector("button[onclick='showJoinGame()']").disabled = true;
}


