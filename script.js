// Configurações do jogo
const gameConfig = {
    difficulty: 'easy',
    theme: 'animals',
    cardSets: {
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🦄', '🦓', '🦒', '🦘', '🦆', '🦅', '🦉', '🦇', '🐝', '🦋', '🐢', '🐊', '🐠', '🐬', '🐳', '🦈'],
        sports: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '🛹', '🛷', '⛸️', '🎽', '🏋️', '🤸', '🤺', '⛷️', '🏂', '🏄', '🚴', '🏊', '🏇', '🧘'],
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏']
    },
    boardSizes: {
        easy: { cols: 4, rows: 4 },
        medium: { cols: 6, rows: 6 },
        hard: { cols: 8, rows: 8 }
    }
};

// Variáveis do jogo
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let score = 0;
let gameStarted = false;
let timerInterval;
let startTime;
let gameEnded = false;

// Elementos do DOM
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupGame();
});

function setupGame() {
    const { cols, rows } = gameConfig.boardSizes[gameConfig.difficulty];
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    // Determinar quantos pares vamos precisar
    totalPairs = (cols * rows) / 2;
    
    // Obter os símbolos para o tema atual
    const symbols = gameConfig.cardSets[gameConfig.theme].slice(0, totalPairs);
    
    // Duplicar os símbolos para criar pares
    let cardSymbols = [...symbols, ...symbols];
    
    // Embaralhar
    cardSymbols = shuffleArray(cardSymbols);
    
    // Limpar o tabuleiro
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    gameStarted = false;
    gameEnded = false;
    clearInterval(timerInterval);
    
    // Atualizar displays
    movesDisplay.textContent = moves;
    timerDisplay.textContent = '00:00';
    scoreDisplay.textContent = score;
    
    // Criar cartas
    cardSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardIndex = index;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        cardFront.textContent = symbol;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        cardBack.textContent = '?';
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', () => flipCard(card, index));
        
        gameBoard.appendChild(card);
        cards.push({
            element: card,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        });
    });
}

function flipCard(cardElement, index) {
    // Evitar flip de cartas já viradas ou quando duas estão sendo comparadas
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2 || gameEnded) {
        return;
    }
    
    // Iniciar o timer na primeira jogada
    if (!gameStarted) {
        startGame();
    }
    
    // Virar a carta
    cardElement.classList.add('flipped');
    cards[index].isFlipped = true;
    flippedCards.push(index);
    
    // Verificar se temos um par para comparar
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        
        // Verificar se é um par
        const [firstIndex, secondIndex] = flippedCards;
        if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
            // Par encontrado
            setTimeout(() => {
                markAsMatched(firstIndex, secondIndex);
            }, 500);
        } else {
            // Não é um par, virar de volta
            setTimeout(() => {
                flipBack(firstIndex, secondIndex);
            }, 1000);
        }
    }
}

function markAsMatched(firstIndex, secondIndex) {
    cards[firstIndex].isMatched = true;
    cards[secondIndex].isMatched = true;
    cards[firstIndex].element.classList.add('matched');
    cards[secondIndex].element.classList.add('matched');
    
    // Adicionar pontos
    const basePoints = 100;
    const timeBonus = Math.max(0, 30 - Math.floor((Date.now() - startTime) / 1000));
    const movesPenalty = Math.max(0, 10 - Math.floor(moves / 2));
    const pointsEarned = basePoints + (timeBonus * 5) + (movesPenalty * 10);
    
    score += pointsEarned;
    scoreDisplay.textContent = score;
    
    matchedPairs++;
    flippedCards = [];
    
    // Verificar se o jogo acabou
    if (matchedPairs === totalPairs) {
        endGame();
    }
}

function flipBack(firstIndex, secondIndex) {
    cards[firstIndex].element.classList.remove('flipped');
    cards[secondIndex].element.classList.remove('flipped');
    cards[firstIndex].isFlipped = false;
    cards[secondIndex].isFlipped = false;
    flippedCards = [];
}

function startGame() {
    gameStarted = true;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function endGame() {
    gameEnded = true;
    clearInterval(timerInterval);
    
    // Exibir modal de fim de jogo
    const finalTime = timerDisplay.textContent;
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalScore').textContent = score;
    
    // Mostrar modal
    document.getElementById('endGameModal').style.display = 'flex';
}

async function saveScore() {
    const playerName = document.getElementById('playerName').value.trim() || 'Anônimo';
    
    // Criar um novo registro de pontuação
    const newScore = {
        name: playerName,
        score: score,
        difficulty: gameConfig.difficulty,
        time: timerDisplay.textContent,
        moves: moves
    };
    
    try {
        const response = await fetch('/api/rankings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newScore)
        });
        
        if (response.ok) {
            // Fechar modal de fim de jogo e mostrar ranking
            closeModal('endGameModal');
            showRanking();
        } else {
            alert('Erro ao salvar pontuação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function showRanking() {
    try {
        const response = await fetch(`/api/rankings?difficulty=${gameConfig.difficulty}`);
        const rankings = await response.json();
        
        const rankingBody = document.getElementById('rankingBody');
        rankingBody.innerHTML = '';
        
        if (rankings.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">Nenhuma pontuação registrada ainda.</td>';
            rankingBody.appendChild(row);
        } else {
            rankings.forEach((rank, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${rank.name}</td>
                    <td>${rank.score}</td>
                    <td>${getDifficultyName(rank.difficulty)}</td>
                    <td>${rank.time}</td>
                `;
                rankingBody.appendChild(row);
            });
        }
        
        document.getElementById('rankingModal').style.display = 'flex';
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        alert('Erro ao carregar ranking');
    }
}

function getDifficultyName(difficulty) {
    const names = {
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil'
    };
    return names[difficulty] || difficulty;
}

function showInstructions() {
    document.getElementById('instructionsModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function setDifficulty(difficulty) {
    if (gameConfig.difficulty !== difficulty) {
        gameConfig.difficulty = difficulty;
        resetGame();
    }
}

function setTheme(theme) {
    if (gameConfig.theme !== theme) {
        gameConfig.theme = theme;
        document.body.className = `theme-${theme}`;
        resetGame();
    }
}

function resetGame() {
    setupGame();
}

// Utilitário para embaralhar array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Fechar modais ao clicar fora deles
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            modals[i].style.display = 'none';
        }
    }
};