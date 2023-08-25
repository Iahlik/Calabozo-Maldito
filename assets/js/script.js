
  document.addEventListener('DOMContentLoaded', () => {
    const backgroundLayers = document.querySelectorAll('.parallax-layer'); // Agrega la clase parallax-layer a tus capas de fondo
    const maxParallaxOffset = 20; // Ajusta el valor según la intensidad deseada del efecto
  
    window.addEventListener('scroll', () => {
      const yOffset = window.pageYOffset;
      
      backgroundLayers.forEach((layer, index) => {
        const parallaxOffset = (yOffset * (index + 1)) / maxParallaxOffset;
        layer.style.backgroundPositionY = `${parallaxOffset}px`;
      });
    });
  });

  

const visitedCells = [];
const visitedEvents = [];


let totalScore = 0; 
let highestScore = 0; // Agrega una variable para almacenar el hi-score

const obstacleMatrix = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function initializeObstacles() {
  const flatObstacleMatrix = obstacleMatrix.flat();
  shuffleArray(flatObstacleMatrix);

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if ((x === 0 && y === 0) || (x === 9 && y === 9)) {
        // Si es la posición del jugador o la meta, no colocar un obstáculo
        obstacleMatrix[y][x] = false;
      } else {
        obstacleMatrix[y][x] = flatObstacleMatrix[y * 10 + x];
      }
    }
  }
}

initializeObstacles();

const cellScores = {
  'visited-monster': 5,
  'visited-treasure': 20,
  'visited-water': 15,
};

const gameBoard = document.getElementById('game-board');
const statusElement = document.getElementById('status');

const player = {
  x: 0,
  y: 0,
  health: 5,
  score: 0,
  moves: 25,
  hasShield: false,
};


let isMoving = false;
let eventInProgress = false;

function updatePlayerInfo() {
  const healthElement = document.getElementById('health');
  const scoreElement = document.getElementById('score');
  const movesElement = document.getElementById('moves');

  healthElement.textContent = player.health;
  scoreElement.textContent = player.score;
  movesElement.textContent = player.moves;
}

function markCellAsVisited(x, y, newClass) {
  const cellIndex = y * 10 + x;
  if (!visitedCells.includes(cellIndex)) {
    visitedCells.push(cellIndex);
  }

  if (!visitedEvents[cellIndex]) {
    visitedEvents[cellIndex] = [];
  }

  if (!visitedEvents[cellIndex].includes(newClass)) {
    visitedEvents[cellIndex].push(newClass);
  }

  const cell = gameBoard.children[cellIndex];
  cell.classList.remove('visited-monster', 'visited-treasure', 'visited-water');
  cell.classList.add(newClass, ...visitedEvents[cellIndex], 'visited');
}

const ghostEmoji = '👻'; // Emoji de fantasma
let ghost = {
  x: 5, // Puedes ajustar la posición inicial del monstruo.
  y: 5, // Puedes ajustar la posición inicial del monstruo.
};

function moveGhost() {
  const dx = Math.sign(player.x - ghost.x);
  const dy = Math.sign(player.y - ghost.y);

  let newX, newY;

  // Decide aleatoriamente si el fantasma se moverá horizontalmente o verticalmente
  if (Math.random() < 0.5) {
    newX = ghost.x + dx;
    newY = ghost.y;
  } else {
    newX = ghost.x;
    newY = ghost.y + dy;
  }

  // Verifica si el movimiento es horizontal o vertical
  if (dx !== 0 && dy === 0) {
    newY = ghost.y; // Mantén la misma posición vertical
  } else if (dy !== 0 && dx === 0) {
    newX = ghost.x; // Mantén la misma posición horizontal
  } else {
    // Si es un movimiento en diagonal, no hagas nada
    return;
  }

  if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && obstacleMatrix[newY][newX] !== 1) {
    obstacleMatrix[ghost.y][ghost.x] = 0;
    ghost.x = newX;
    ghost.y = newY;
    obstacleMatrix[ghost.y][ghost.x] = 'ghost';

    // Verifica si el fantasma alcanzó al jugador.
    if (ghost.x === player.x && ghost.y === player.y) {
      // Resta todas las vidas del jugador.
      player.health = 0;

      // Actualiza la información del jugador.
      updatePlayerInfo();

      // Finaliza el juego.
      if (player.health <= 0) {
        alert('¡Has perdido! El monstruo te ha alcanzado.');
      }
    }
  }
}

function showEventMessage(message, emoji) {
  eventInProgress = true;
  statusElement.textContent = '';

  let index = 0;
  const typingInterval = 25;

  const typingIntervalId = setInterval(() => {
    if (index < message.length) {
      statusElement.textContent += message[index];
      index++;
    } else {
      clearInterval(typingIntervalId);
      statusElement.insertAdjacentHTML('beforeend', `<span class="emoji">${emoji}</span>`);
      eventInProgress = false;
    }
  }, typingInterval);
}

function flashCell(x, y) {
  const cellIndex = y * 10 + x;
  const cell = gameBoard.children[cellIndex];

  cell.classList.add('flash');
  setTimeout(() => {
    cell.classList.remove('flash');
  }, 500);
}

function movePlayer(newX, newY) {
  if (!eventInProgress && !isMoving && newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
    isMoving = true;

    const oldX = player.x;
    const oldY = player.y;

    if (newX === player.x && newY === player.y) {
      if (visitedCells.includes(newY * 10 + newX)) {
        statusElement.textContent = 'Ya has vuelto a este lugar.';
      } else {
        player.moves--;
        updatePlayerInfo();
      }
      isMoving = false;
      return;
    }

    player.x = newX;
    player.y = newY;

    const cellIndex = newY * 10 + newX;
    const cell = gameBoard.children[cellIndex];
    cell.style.transition = 'transform 0.2s ease-in-out';
    cell.style.transform = 'scale(1.1)';



    setTimeout(() => {
     
      cell.style.transition = '';
      cell.style.transform = '';

      flashCell(player.x, player.y);

        
      

      updateGame();

      markCellAsVisited(player.x, player.y, 'visited');

      const eventChance = Math.random();

      if (eventChance < 0.4) {
        if (player.hasShield) {
          player.hasShield = false; // Consumir el escudo
          statusElement.textContent = 'El escudo ha bloqueado al monstruo.';
          markCellAsVisited(player.x, player.y, 'visited-shield');
        } else {
          player.health--;
          updatePlayerInfo();
          updateGame();
          showEventMessage('¡Te ataca un monstruo! -1', '💓');
          markCellAsVisited(player.x, player.y, 'visited-monster');

          if (visitedEvents[cellIndex].includes('visited-monster')) {
            const swordCutEffect = document.createElement('div');
            swordCutEffect.classList.add('flash-sword');
            cell.appendChild(swordCutEffect);

            setTimeout(() => {
              cell.removeChild(swordCutEffect);
            }, 500);
          }
        }
      } else if (eventChance < 0.6) {
        player.score += 50;
        updateScoreElement(player.score);
        showEventMessage('¡Encontraste un tesoro! +50', '💰');
        markCellAsVisited(player.x, player.y, 'visited-treasure');
      } else if (eventChance < 0.8) {
        player.moves++;
        updateScoreElement(player.score);
        showEventMessage('Una fuente de agua te refresca. +1', '👣');
        markCellAsVisited(player.x, player.y, 'visited-water');
      } else if (eventChance < 0.9 && !player.hasShield) {
        player.hasShield = true;
        statusElement.textContent = '¡Encontraste un escudo! 🛡️';
        markCellAsVisited(player.x, player.y, 'visited-shield'); 
      } else {
        statusElement.textContent = 'Explorando...';
        markCellAsVisited(oldX, oldY, 'visited');
      }

      if (player.health <= 0) {
        alert('¡Has perdido! Te quedaste sin vidas.');
      } else if (player.moves <= 0) {
        alert('¡Has perdido! Te quedaste sin movimientos.');
      }

      if (player.x === 9 && player.y === 9) {
        const finalScore = calculateTotalScore();
        alert(`¡Has ganado! Escapaste del calabozo.\nPuntaje total: ${highestScore}`);
      
        // Actualiza el puntaje total en la interfaz
        const totalScoreElement = document.getElementById('total-score');
        totalScoreElement.textContent = finalScore;
      }

      player.moves--;
      updatePlayerInfo();
      isMoving = false;
    }, 200);
  }
}

const exchangeButton = document.getElementById('exchange-button');

exchangeButton.addEventListener('click', () => {
  if (player.score >= 100 && player.health < 5) {
    player.score -= 100;
    player.health++;
    updatePlayerInfo();
    updateScoreElement();
    updateGame(); // Add this line to update the player's emoji
    statusElement.textContent = 'Canje realizado: Ganaste una vida.';

    const healthElement = document.getElementById('health');
    healthElement.classList.add('life-increase-animation');
    setTimeout(() => {
      healthElement.classList.remove('life-increase-animation');
    }, 1000);
  } else if (player.score < 100) {
    statusElement.textContent = 'No tienes suficientes puntos para canjear.';
  } else if (player.health >= 5) {
    statusElement.textContent = 'Ya tienes la cantidad máxima de vidas.';
  }
});

function updateGame() {
  gameBoard.innerHTML = '';

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (obstacleMatrix[y][x] === 1) {
        cell.classList.add('obstacle');
      }

      const cellIndex = y * 10 + x;
      if (visitedCells.includes(cellIndex) && visitedEvents[cellIndex]) {
        cell.classList.add(...visitedEvents[cellIndex], 'visited');
      }

      if (x === player.x && y === player.y) {
        if (player.hasShield) {
          cell.textContent = '🛡️'; // Emoji del escudo
        } else {
          // Update the emoji based on player's health
          if (player.health === 5) {
            cell.textContent = '😄';
          } else if (player.health === 4) {
            cell.textContent = '🙂';
          } else if (player.health === 3) {
            cell.textContent = '😮';
          } else if (player.health === 2) {
            cell.textContent = '😑';
          } else if (player.health === 1) {
            cell.textContent = '😖';
          } else {
            cell.textContent = '💀';
          }
        }
        cell.classList.add('player');
      } else if (x === ghost.x && y === ghost.y) {
        cell.textContent = ghostEmoji; // Emoji del fantasma
        cell.classList.add('ghost'); // Clase para estilos del fantasma
      } 
      gameBoard.appendChild(cell);
    }
  }
}



updateGame();
updatePlayerInfo();

document.addEventListener('keydown', (event) => {
  event.preventDefault();

  if (!isMoving && player.moves > 0) {
    let newX = player.x;
    let newY = player.y;

    switch (event.key) {
      case 'ArrowUp':
        newY -= 1;
        break;
      case 'ArrowDown':
        newY += 1;
        break;
      case 'ArrowLeft':
        newX -= 1;
        break;
      case 'ArrowRight':
        newX += 1;
        break;
    }

    if (obstacleMatrix[newY][newX] !== 1) {
      movePlayer(newX, newY);
      moveGhost();
    }
  }
});

const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

upButton.addEventListener('click', () => movePlayer(player.x, player.y - 1));
downButton.addEventListener('click', () => movePlayer(player.x, player.y + 1));
leftButton.addEventListener('click', () => movePlayer(player.x - 1, player.y));
rightButton.addEventListener('click', () => movePlayer(player.x + 1, player.y));


function calculateTotalScore() {
  let calculatedScore = 0; // Cambia el nombre de la variable local
  visitedCells.forEach(cellIndex => {
    const cellClasses = visitedEvents[cellIndex];
    cellClasses.forEach(className => {
      if (cellScores[className] !== undefined) {
        calculatedScore += cellScores[className]; // Usa la variable local
      }
    });
  });
  return calculatedScore; // Cambia el nombre de la variable local
}

function updateScoreElement() {
  totalScore = calculateTotalScore();
  const scoreElement = document.getElementById('total-score');
  scoreElement.textContent = totalScore;

  // Actualiza el puntaje más alto si el nuevo puntaje es mayor
  if (totalScore > highestScore) {
    highestScore = totalScore;
    const highestScoreElement = document.getElementById('highest-score');
    highestScoreElement.textContent = highestScore; // Actualiza el elemento en la interfaz
  }
}


const resetButton = document.getElementById('reset-button');

resetButton.addEventListener('click', () => {
  resetGame();
});

function resetGame() {
  visitedCells.length = 0;
  visitedEvents.length = 0;

  player.x = 0;
  player.y = 0;
  player.health = 5;
  player.moves = 25;
  score = 0;
  player.hasShield = false;
  ghost.x = 5;
  ghost.y = 5;

  // Recalcula el puntaje total desde cero
  totalScore = calculateTotalScore();

  initializeObstacles(); 
  updateGame();
  updatePlayerInfo();
  updateScoreElement(); // Asegúrate de actualizar el puntaje después de reiniciar
  statusElement.textContent = 'Partida reiniciada.';
};
