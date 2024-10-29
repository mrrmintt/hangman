const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Store game sessions in memory
let gameSessions = {};

// Serve the main HTML page at '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// Serve the hangman game page at '/hangman'
app.get('/hangman', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'hangman.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle creating a new game
    socket.on('createGame', () => {
        const gameCode = generateGameCode();
        gameSessions[gameCode] = { players: [socket], creator: socket };
        socket.join(gameCode);
        socket.emit('gameCreated', { gameCode, playerCount: 1 });
        console.log(`Game created with code: ${gameCode}`);
    });

    // Handle joining an existing game
    socket.on('joinGame', (gameCode) => {
        if (gameSessions[gameCode]) {
            gameSessions[gameCode].players.push(socket);
            socket.join(gameCode);

            // Notify all players in the game session of the updated player count
            const playerCount = gameSessions[gameCode].players.length;
            io.to(gameCode).emit('playerCountUpdate', playerCount);

            socket.emit('joinedGame', { success: true, gameCode });
            io.to(gameCode).emit('newPlayer', 'A new player has joined the game');
            console.log(`Player joined game with code: ${gameCode}`);
        } else {
            socket.emit('joinedGame', { success: false, message: 'Invalid game code' });
            console.log(`Invalid game code: ${gameCode}`);
        }
    });

    // Handle start game
    socket.on('startGame', (gameCode) => {
        if (gameSessions[gameCode] && gameSessions[gameCode].creator === socket) {
            io.to(gameCode).emit('gameStarted');
            console.log(`Game with code ${gameCode} has started`);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove the player from any game session they were part of
        for (const gameCode in gameSessions) {
            const session = gameSessions[gameCode];
            const playerIndex = session.players.indexOf(socket);
            if (playerIndex !== -1) {
                session.players.splice(playerIndex, 1);

                // Notify remaining players of the updated player count
                const playerCount = session.players.length;
                io.to(gameCode).emit('playerCountUpdate', playerCount);

                if (playerCount === 0) {
                    delete gameSessions[gameCode]; // Clean up empty game sessions
                }
                break;
            }
        }
    });
});

// Generate a random 6-digit game code
function generateGameCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
